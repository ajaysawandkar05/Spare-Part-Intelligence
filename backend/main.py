"""
HWL Spare Parts – FastAPI Backend
Endpoints:
  POST /api/query        – multi-modal retrieval (image + text)
  GET  /api/materials    – list all indexed materials
  GET  /api/material/{id} – single material metadata
  GET  /api/image/{id}   – serve material image
  POST /api/index/rebuild – re-build CLIP index from scratch
  GET  /api/health       – health check
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os
import json
import tempfile
from pathlib import Path
from typing import Optional

from clip_engine import CLIPEngine

app = FastAPI(title="HWL Spare Parts Retrieval API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IMAGES_DIR   = Path("../data/hwl_images")
DATASET_JSON = Path("../data/hwl_dataset.json")
INDEX_PATH   = Path("../data/hwl_clip_index.npz")

engine = CLIPEngine(
    dataset_json=str(DATASET_JSON),
    index_path=str(INDEX_PATH),
    images_dir=str(IMAGES_DIR),
)


@app.on_event("startup")
async def startup():
    engine.load()
    print("[startup] CLIP engine ready.")


@app.get("/api/health")
def health():
    return {
        "status":          "ok",
        "materials_count": engine.count(),
        "index_loaded":    engine.is_loaded(),
    }


@app.post("/api/query")
async def query(
    image: Optional[UploadFile] = File(None),
    text:  Optional[str]        = Form(None),
    top_k: int                  = Form(5),
    visual_weight: float        = Form(0.5),
    text_weight:   float        = Form(0.5),
    filter_part_type: Optional[str] = Form(None),
):
    if not image and not text:
        raise HTTPException(400, "Provide at least an image or text query.")

    image_path = None
    try:
        if image:
            suffix = Path(image.filename).suffix or ".jpg"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(await image.read())
                image_path = tmp.name

        results = engine.query(
            image_path=image_path,
            text=text,
            top_k=top_k,
            visual_weight=visual_weight,
            text_weight=text_weight,
            filter_part_type=filter_part_type,
        )
        return {"results": results, "query_mode": _mode(image_path, text)}

    finally:
        if image_path and os.path.exists(image_path):
            os.unlink(image_path)


@app.get("/api/materials")
def list_materials():
    return {"materials": engine.all_materials()}


@app.get("/api/material/{material_id}")
def get_material(material_id: str):
    mat = engine.get_material(material_id)
    if not mat:
        raise HTTPException(404, f"Material '{material_id}' not found.")
    return mat


@app.get("/api/image/{material_id}")
def serve_image(material_id: str):
    folder = IMAGES_DIR / material_id

    if not folder.exists():
        raise HTTPException(404, "Material folder not found.")

    # Get all valid image files
    image_files = sorted([
        f for f in folder.glob("*")
        if f.is_file() and f.suffix.lower() in [".png", ".jpg", ".jpeg", ".webp"]
    ])

    if not image_files:
        raise HTTPException(404, "No images found.")

    # Return first image (or you can randomize)
    img_path = image_files[0]

    return FileResponse(str(img_path))


@app.post("/api/index/rebuild")
def rebuild_index():
    engine.rebuild()
    return {"status": "ok", "materials_indexed": engine.count()}


def _mode(image_path, text):
    if image_path and text:
        return "multimodal"
    if image_path:
        return "visual"
    return "text"


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)