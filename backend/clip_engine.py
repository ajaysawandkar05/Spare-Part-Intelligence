"""
CLIP Engine — v5
Changes from v3 (uploaded file):
  - DINOv2 added     : separate fine-grained visual index (facebook/dinov2-base)
  - rebuild()        : builds CLIP index + DINOv2 index separately
  - rebuild()        : max pooling instead of averaging (no prototype collapse)
  - rebuild()        : rotations removed, brightness+contrast only (safe augments)
  - query()          : visual score = 70% DINOv2 + 30% CLIP (fine-grained wins)
  - query()          : text search still uses CLIP only (DINOv2 has no text space)
  - query()          : final_score shows raw cosine, not sharpened probability
  - TEMPERATURE      : changed to 0.01 (clear winner separation)

Architecture:
  Image query  →  DINOv2 (70%) + CLIP visual (30%)  →  visual_score
  Text query   →  CLIP cross-modal (35%) + description match (65%)  →  text_score
  Both         →  visual_weight * visual + text_weight * text  →  final_score
"""


import os
import json
import random
from collections import defaultdict
import unicodedata
import re

import numpy as np
import torch
from PIL import Image, ImageEnhance
from transformers import (
    CLIPModel, CLIPProcessor,
    AutoImageProcessor, AutoModel,
)


CLIP_MODEL  = "openai/clip-vit-base-patch32"
DINO_MODEL  = "facebook/dinov2-base"   # 768-dim, ViT-B/14

PART_TYPES = [
    "photoelectric sensor", "relay", "actuator", "connector",
    "bracket", "cable", "screw", "handle", "valve", "pneumatic",
    "spring", "pin", "shaft", "rod", "drill bit", "cutting",
    "terminal block", "retaining ring", "control panel"
]


class CLIPEngine:

    def __init__(self, dataset_json: str, index_path: str, images_dir: str):
        self.dataset_json = dataset_json
        self.index_path   = index_path
        self.images_dir   = images_dir

        self._device = "cuda" if torch.cuda.is_available() else "cpu"

        # CLIP — text + visual (512-dim)
        self._model:     CLIPModel     = None
        self._processor: CLIPProcessor = None

        # DINOv2 — fine-grained visual only (768-dim)
        self._dino_model:     AutoModel          = None
        self._dino_processor: AutoImageProcessor = None

        # CLIP image index — multiple vectors per material (max pooled)
        self._embeddings:   np.ndarray = None
        self._material_ids: list       = None

        # DINOv2 image index — multiple vectors per material (max pooled)
        self._dino_embeddings:   np.ndarray = None
        self._dino_material_ids: list       = None

        # Text index — one CLIP text vector per material
        self._txt_embeddings:   np.ndarray = None
        self._txt_material_ids: list       = None

        self._metadata:     dict = {}
        self._descriptions: dict = {}
        self._erp_descriptions: dict = {}  # Always initialize to avoid AttributeError

    # ──────────────────────────────────────────
    # Lifecycle
    # ──────────────────────────────────────────
    def load(self):
        self._load_model()
        self._load_metadata()
        self._load_erp_descriptions()
        if os.path.exists(self.index_path):
            self._load_index()
        else:
            print("[CLIPEngine] No index found — building now ...")
            self.rebuild()

    def _load_model(self):
        # Load CLIP
        print(f"[CLIPEngine] Loading CLIP ({CLIP_MODEL}) on {self._device} ...")
        self._model     = CLIPModel.from_pretrained(CLIP_MODEL).to(self._device)
        self._processor = CLIPProcessor.from_pretrained(CLIP_MODEL)
        self._model.eval()

        # Load DINOv2
        print(f"[CLIPEngine] Loading DINOv2 ({DINO_MODEL}) on {self._device} ...")
        self._dino_processor = AutoImageProcessor.from_pretrained(DINO_MODEL)
        self._dino_model     = AutoModel.from_pretrained(DINO_MODEL).to(self._device)
        self._dino_model.eval()
        print(f"[CLIPEngine] Both models loaded on {self._device}.")

    def _load_metadata(self):
        if not os.path.exists(self.dataset_json):
            return
        with open(self.dataset_json) as f:
            dataset = json.load(f)
        self._metadata = {item["material_id"]: item for item in dataset}
        
    def _load_erp_descriptions(self):
        """
        Loads ERP/SAP descriptions from hwl_erp_descriptions.json.
        Format: [{"Material": "59-1068347-00003", "Material Description": "ORANJE - OOGBOUT M16"}]
        """
        erp_path = os.path.join(os.path.dirname(self.dataset_json), "hwl_erp_descriptions.json")
        if os.path.exists(erp_path):
            with open(erp_path, encoding="utf-8") as f:
                data = json.load(f)
            # Always load all materials, even if description is null
            self._erp_descriptions = {
                str(item["Material"]): str(item.get("Material Description") or "")
                for item in data
            }
            print(f"[CLIPEngine] Loaded {len(self._erp_descriptions)} ERP descriptions (including empty).")
            # Print a few samples for debug
            for i, (k, v) in enumerate(self._erp_descriptions.items()):
                print(f"  Sample {i+1}: {k} -> {v}")
                if i >= 4:
                    break
            # Print a known material for verification
            test_id = "59-1068252-00010"
            print(f"[DEBUG] Test ERP desc for {test_id}: '{self._erp_descriptions.get(test_id)}'")
        else:
            print("[CLIPEngine] No hwl_erp_descriptions.json — keyword search uses Qwen desc only.")

    def _load_index(self):
        data = np.load(self.index_path, allow_pickle=True)

        # CLIP image index
        self._embeddings   = data["embeddings"]
        self._material_ids = data["material_ids"].tolist()

        # DINOv2 index
        if "dino_embeddings" in data:
            self._dino_embeddings   = data["dino_embeddings"]
            self._dino_material_ids = data["dino_material_ids"].tolist()
        else:
            print("[CLIPEngine] WARNING: No DINOv2 index found — rebuild to add it.")

        # Text index
        if "txt_embeddings" in data:
            self._txt_embeddings   = data["txt_embeddings"]
            self._txt_material_ids = data["txt_material_ids"].tolist()

        # Load descriptions for part-type filter
        desc_path = os.path.join(os.path.dirname(self.dataset_json), "hwl_descriptions.json")
        if os.path.exists(desc_path):
            with open(desc_path) as f:
                self._descriptions = json.load(f)

        unique_clip = len(set(self._material_ids))
        total_clip  = len(self._material_ids)
        unique_dino = len(set(self._dino_material_ids)) if self._dino_material_ids else 0
        total_dino  = len(self._dino_material_ids)      if self._dino_material_ids else 0
        txt_count   = len(self._txt_material_ids)       if self._txt_material_ids else 0

        print(f"[CLIPEngine] Index loaded:")
        print(f"  CLIP  : {total_clip} vectors across {unique_clip} materials")
        print(f"  DINOv2: {total_dino} vectors across {unique_dino} materials")
        print(f"  Text  : {txt_count} vectors")

    # ──────────────────────────────────────────
    # CHANGED: rebuild — CLIP + DINOv2, max pool, no rotations
    # ──────────────────────────────────────────
    def rebuild(self):
        self._load_metadata()
        self._load_erp_descriptions()

        desc_path = os.path.join(os.path.dirname(self.dataset_json), "hwl_descriptions.json")
        descriptions = {}
        if os.path.exists(desc_path):
            with open(desc_path) as f:
                descriptions = json.load(f)
            self._descriptions = descriptions
            print(f"[CLIPEngine] Loaded {len(descriptions)} text descriptions.")
        else:
            print("[CLIPEngine] No descriptions found — image search only.")

        clip_embeddings      = []
        clip_material_ids    = []
        dino_embeddings      = []
        dino_material_ids    = []
        txt_embeddings       = []
        txt_material_ids     = []

        total = len(self._metadata)
        for i, (mat_id, item) in enumerate(self._metadata.items(), 1):
            print(f"  [{i:>3}/{total}] {mat_id} ...", end=" ", flush=True)

            # Collect all image files
            mat_dir     = os.path.join(self.images_dir, mat_id)
            image_files = []
            if os.path.isdir(mat_dir):
                image_files = sorted([
                    os.path.join(mat_dir, f)
                    for f in os.listdir(mat_dir)
                    if f.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
                ])
            if not image_files:
                fallback = item.get("image_path")
                if fallback and os.path.exists(fallback):
                    image_files = [fallback]
            if not image_files:
                print("WARNING: no images, skipping.")
                continue

            # ── Encode each image with BOTH models + augmentations ─
            for img_path in image_files:
                try:
                    img = Image.open(img_path).convert("RGB")

                    # Original — stored twice for higher effective weight
                    clip_orig = self._encode_pil_clip(img)
                    dino_orig = self._encode_pil_dino(img)
                    for _ in range(2):
                        clip_embeddings.append(clip_orig)
                        clip_material_ids.append(mat_id)
                        dino_embeddings.append(dino_orig)
                        dino_material_ids.append(mat_id)

                    # Brightness variation — safe for all part types
                    bright = ImageEnhance.Brightness(img).enhance(
                        random.uniform(0.75, 1.25))
                    clip_embeddings.append(self._encode_pil_clip(bright))
                    clip_material_ids.append(mat_id)
                    dino_embeddings.append(self._encode_pil_dino(bright))
                    dino_material_ids.append(mat_id)

                    # Contrast variation — safe for all part types
                    contrast = ImageEnhance.Contrast(img).enhance(
                        random.uniform(0.8, 1.2))
                    clip_embeddings.append(self._encode_pil_clip(contrast))
                    clip_material_ids.append(mat_id)
                    dino_embeddings.append(self._encode_pil_dino(contrast))
                    dino_material_ids.append(mat_id)

                    # NOTE: No rotations — asymmetric parts (sensors, connectors)
                    # get worse results with rotation augmentation

                except Exception as e:
                    print(f"\n  Warning: could not encode {img_path}: {e}")

            # ── Text embedding — CLIP only (one per material) ────────
            text_parts = []
            if mat_id in descriptions:
                text_parts.append(descriptions[mat_id])
            erp = self._erp_descriptions.get(mat_id, "")
            if erp:
                text_parts.append(erp)
            text_parts.append(f"material id {mat_id}")
            if item.get("storage_bin"):
                text_parts.append(f"storage bin {item['storage_bin']}")
            if item.get("plant"):
                text_parts.append(f"plant {item['plant']}")

            full_text = ". ".join(text_parts)
            txt_emb   = self._encode_text(full_text)
            txt_embeddings.append(txt_emb)
            txt_material_ids.append(mat_id)

            print("OK")

        self._embeddings         = np.stack(clip_embeddings)
        self._material_ids       = clip_material_ids
        self._dino_embeddings    = np.stack(dino_embeddings)
        self._dino_material_ids  = dino_material_ids
        self._txt_embeddings     = np.stack(txt_embeddings)
        self._txt_material_ids   = txt_material_ids

        np.savez(
            self.index_path,
            embeddings=self._embeddings,
            material_ids=np.array(clip_material_ids),
            dino_embeddings=self._dino_embeddings,
            dino_material_ids=np.array(dino_material_ids),
            txt_embeddings=self._txt_embeddings,
            txt_material_ids=np.array(txt_material_ids),
        )

        unique = len(set(clip_material_ids))
        print(f"\n[CLIPEngine] Index built:")
        print(f"  CLIP  : {len(clip_material_ids)} vectors across {unique} materials")
        print(f"  DINOv2: {len(dino_material_ids)} vectors")
        print(f"  Text  : {len(txt_material_ids)} vectors → {self.index_path}")

    # ──────────────────────────────────────────
    # Encoding helpers
    # ──────────────────────────────────────────
    def _encode_pil_clip(self, img: Image.Image) -> np.ndarray:
        inputs = self._processor(images=img, return_tensors="pt").to(self._device)
        with torch.no_grad():
            raw = self._model.get_image_features(**inputs)
            emb = raw if isinstance(raw, torch.Tensor) else (
                raw.image_embeds if hasattr(raw, "image_embeds") else raw.pooler_output
            )
            emb = emb / emb.norm(dim=-1, keepdim=True)
        return emb.squeeze().cpu().numpy()

    def _encode_pil_dino(self, img: Image.Image) -> np.ndarray:
        inputs = self._dino_processor(images=img, return_tensors="pt").to(self._device)
        with torch.no_grad():
            outputs = self._dino_model(**inputs)
            # CLS token = global image representation
            emb = outputs.last_hidden_state[:, 0, :]
            emb = emb / emb.norm(dim=-1, keepdim=True)
        return emb.squeeze().cpu().numpy()

    def _encode_image(self, image_path: str) -> tuple:
        """Returns (clip_emb, dino_emb) for a query image."""
        img = Image.open(image_path).convert("RGB")
        return self._encode_pil_clip(img), self._encode_pil_dino(img)

    def _encode_text(self, text: str) -> np.ndarray:
        inputs = self._processor(
            text=[text], return_tensors="pt", padding=True, truncation=True
        ).to(self._device)
        with torch.no_grad():
            raw = self._model.get_text_features(**inputs)
            emb = raw if isinstance(raw, torch.Tensor) else (
                raw.text_embeds if hasattr(raw, "text_embeds") else raw.pooler_output
            )
            emb = emb / emb.norm(dim=-1, keepdim=True)
        return emb.squeeze().cpu().numpy()
    
    def _keyword_score(self, query: str, material_id: str) -> float:
        """
        Scores how well a text query matches a material's ERP description or material_id only.
        Uses case-insensitive substring and partial matching.
        """
        def normalize(s: str) -> str:
            s = s.lower().strip()
            s = unicodedata.normalize("NFKD", s)
            s = "".join(c for c in s if not unicodedata.combining(c))
            s = re.sub(r"[^\w\s]", " ", s)
            return re.sub(r"\s+", " ", s).strip()

        # Try both as-is and str() for material_id to avoid key mismatch
        erp_desc  = self._erp_descriptions.get(material_id, "")
        if not erp_desc and str(material_id) in self._erp_descriptions:
            erp_desc = self._erp_descriptions[str(material_id)]
        # Combine all searchable text (ERP + material_id only)
        searchable = f"{erp_desc if erp_desc else ''} {material_id}"
        searchable_norm = normalize(searchable)
        q_norm = normalize(query)


        if not q_norm or not searchable_norm:
            print("[DEBUG] Empty query or searchable string, returning 0.0")
            return 0.0

        # Case-insensitive substring match (strongest)
        # Exact substring → strong boost
        if q_norm in searchable_norm:
           return 1.0

# 🔥 Token-level fuzzy matching
        query_words = [w for w in q_norm.split() if len(w) >= 2]
        search_tokens = searchable_norm.split()

        score = 0
        for qw in query_words:
            for token in search_tokens:
        # partial match
                if qw in token:
                   score += 1
                   break
        # fuzzy match (typo tolerance)
                elif abs(len(qw) - len(token)) <= 2 and sum(c1 != c2 for c1, c2 in zip(qw, token[:len(qw)])) <= 2:
                    score += 0.7
                    break

        return score / len(query_words) if query_words else 0.0

    

    # ──────────────────────────────────────────
    # CHANGED: query — DINOv2 + CLIP fusion, max pool, raw score display
    # ──────────────────────────────────────────
    def query(
        self,
        image_path: str       = None,
        text: str             = None,
        top_k: int            = 5,
        visual_weight: float  = 0.5,
        text_weight: float    = 0.5,
        filter_part_type: str = None,
    ) -> list[dict]:

        # ── Method 1: Attribute pre-filter ───────────────────────
        if filter_part_type and filter_part_type.lower() != "all":
            allowed_ids = set(
                mid for mid in set(self._material_ids)
                if filter_part_type.lower() in
                   self._descriptions.get(mid, "").lower()
            )
            if not allowed_ids:
                allowed_ids = set(self._material_ids)
        else:
            allowed_ids = set(self._material_ids)

        # ── Encode query ──────────────────────────────────────────
        q_clip = None
        q_dino = None

        if image_path:
            q_clip, q_dino = self._encode_image(image_path)
        

        # ── Visual scoring — MAX POOL per material ────────────────
        # DINOv2 (fine-grained) weighted 70%, CLIP visual 30%
        mat_visual = defaultdict(float)

        if q_clip is not None and q_dino is not None:
            clip_raw = self._embeddings @ q_clip   # (N,)
            dino_raw = (self._dino_embeddings @ q_dino
                        if self._dino_embeddings is not None
                        else np.zeros(len(self._material_ids)))

            for idx, mid in enumerate(self._material_ids):
                if mid in allowed_ids:
                    # 70% DINOv2 + 30% CLIP for image queries
                    dino_score = float(dino_raw[idx]) if self._dino_embeddings is not None else 0.0
                    fused = 0.7 * dino_score + 0.3 * float(clip_raw[idx])
                    mat_visual[mid] = max(mat_visual[mid], fused)


        # ── Text description scoring ──────────────────────────────
        # CLIP text query vs CLIP text description embeddings
        # Only use keyword score for text search (ignore CLIP text embeddings)
        mat_keyword = defaultdict(float)
        if text:
            for mid in allowed_ids:
                mat_keyword[mid] = self._keyword_score(text, mid)

        # ── Fuse visual + text ────────────────────────────────────
        all_mats   = set(mat_visual) | set(mat_keyword)
        raw_scores = {}

        for mid in all_mats:
            v = mat_visual.get(mid, 0.0)
            k = mat_keyword.get(mid, 0.0)

            if image_path and text:
        # 🔥 Best hybrid
               raw_scores[mid] = 0.6 * v + 0.4 * k

            elif image_path:
                 raw_scores[mid] = v

            else:
        # 🔥 PURE TEXT SEARCH
                raw_scores[mid] = k


        # ── Use RAW scores directly (no temperature scaling) ─────
        final_scores = raw_scores

# ── Rank by raw cosine similarity ────────────────────────
        ranked = sorted(final_scores.items(), key=lambda x: -x[1])[:top_k]

        # ── Method 8: Confidence detection ───────────────────────
        if len(ranked) >= 2:
            top1 = ranked[0][1]
            top2 = ranked[1][1]
            confidence = "low" if (top1 - top2) < (top1 * 0.15) else "high"
        else:
            confidence = "high"

        results = []
        for rank, (mid, score) in enumerate(ranked, 1):
            meta = self._metadata.get(mid, {})
            erp_d   = self._erp_descriptions.get(mid, "")
            results.append({
                "rank":             rank,
                "material_id":      mid,
                # Show sharpened score — clear winner separation (0.79 vs 0.13)
                "final_score":      round(score, 3),
                # Raw cosine for visual/text breakdowns — meaningful to user
                "visual_score":     round(float(mat_visual.get(mid, 0.0)), 4) if image_path else None,
                "text_score":       round(float(mat_keyword.get(mid, 0.0)),   4) if text       else None,
                "keyword_score":    round(float(mat_keyword.get(mid, 0.0)), 4) if text       else None,
                "storage_bin":      meta.get("storage_bin"),
                "total_stock":      meta.get("total_stock"),
                "storage_location": meta.get("storage_location"),
                "plant":            meta.get("plant"),
                "duration":         meta.get("duration"),
                "description":      meta.get("description"),
                "image_url":        f"/api/image/{mid}",
                "confidence":       confidence if rank == 1 else None,
            })
        return results

    # ──────────────────────────────────────────
    # Helpers
    # ──────────────────────────────────────────
    def is_loaded(self) -> bool:
        return self._embeddings is not None

    def count(self) -> int:
        return len(set(self._material_ids)) if self._material_ids else 0

    def all_materials(self) -> list[dict]:
        return list(self._metadata.values())

    def get_material(self, material_id: str) -> dict | None:
        return self._metadata.get(material_id)