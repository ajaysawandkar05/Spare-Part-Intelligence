import pandas as pd
from pathlib import Path
import json
from PIL import Image
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration

# ----------------------------
# CONFIG
# ----------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

EXCEL_PATH = BASE_DIR / "data/HWL Materials.xlsx"
IMAGES_ROOT = BASE_DIR / "data/hwl_images"

OUTPUT_DATASET = BASE_DIR / "data/hwl_dataset.json"
OUTPUT_DESCRIPTIONS = BASE_DIR / "data/hwl_descriptions.json"

# ----------------------------
# DEVICE
# ----------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"🚀 Using device: {device}")

# ----------------------------
# LOAD BLIP BASE MODEL
# ----------------------------
print("🔄 Loading BLIP base model...")

processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-base"
).to(device)

# ----------------------------
# CAPTION FUNCTION (IMPROVED)
# ----------------------------
def generate_caption(image_path):
    try:
        image = Image.open(image_path).convert("RGB")

        # IMPORTANT: no prompt → better for BLIP
        inputs = processor(image, return_tensors="pt").to(device)

        with torch.no_grad():
            output = model.generate(**inputs, max_new_tokens=40)

        caption = processor.decode(output[0], skip_special_tokens=True)

        # improve output slightly
        caption = f"industrial spare part: {caption}".lower()

        return caption.strip()

    except Exception as e:
        print(f"❌ Error: {e}")
        return "no description available"

# ----------------------------
# LOAD EXCEL
# ----------------------------
print("📄 Reading Excel...")
df = pd.read_excel(EXCEL_PATH)
df.columns = df.columns.str.strip()

dataset = []
descriptions_dict = {}

# ----------------------------
# MAIN LOOP
# ----------------------------
print("⚙️ Processing...")

for idx, row in df.iterrows():

    material_id = str(row["Material"]).strip()
    folder = IMAGES_ROOT / material_id

    image_files = []
    if folder.exists():
        image_files = sorted([
            f for f in folder.glob("*")
            if f.is_file() and f.suffix.lower() in [".png", ".jpg", ".jpeg", ".webp"]
        ])

    image_list = [str(f).replace("\\", "/") for f in image_files]

    # ----------------------------
    # DESCRIPTION
    # ----------------------------
    if image_files:
        print(f"🧠 Generating: {material_id}")
        description = generate_caption(image_files[0])
    else:
        description = "no image available"

    # save for CLIP engine
    descriptions_dict[material_id] = description

    # ----------------------------
    # DATA ENTRY
    # ----------------------------
    data_entry = {
        "material_id": material_id,
        "storage_type": str(row.get("Storage Type", "")),
        "storage_bin": str(row.get("Storage Bin", "")),
        "total_stock": int(row.get("Total Stock", 0)),
        "storage_location": str(row.get("Storage Location", "")),
        "plant": str(row.get("Plant", "")),
        "duration": int(row.get("Duration", 0)),
        "images": image_list,
        "description": description
    }

    dataset.append(data_entry)

    print(f"✅ {material_id} → {description}")

# ----------------------------
# SAVE FILES
# ----------------------------
print("💾 Saving files...")

with open(OUTPUT_DATASET, "w") as f:
    json.dump(dataset, f, indent=2)

with open(OUTPUT_DESCRIPTIONS, "w") as f:
    json.dump(descriptions_dict, f, indent=2)

print("🎉 Done! Generated:")
print(" - hwl_dataset.json")
print(" - hwl_descriptions.json")