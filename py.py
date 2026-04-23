import json

file_path = r"C:\Users\ajays\Desktop\Spare_Part_Recognition\data\hwl_dataset.json"  # change if needed

# ---- LOAD ----
with open(file_path, "r") as f:
    data = json.load(f)

# ---- UPDATE ----
for item in data:
    item["storage_location"] = "OKSP"

# ---- SAVE ----
with open(file_path, "w") as f:
    json.dump(data, f, indent=4)

print("✅ All storage_location updated to OKSP")