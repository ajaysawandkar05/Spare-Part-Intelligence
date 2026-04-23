
# HWL Spare Parts Intelligence (CLIP + DINOv2)

Advanced multi-modal spare parts recognition and retrieval system for industrial applications.

---

## Features

- Image-based search (DINOv2 + CLIP fusion)
- Text-based search (CLIP)
- Multi-modal search (image + text)
- Fine-grained matching using DINOv2
- FastAPI backend (Python)
- React frontend (Vite)
- Confidence scoring
- Part-type filtering

---

## Tech Stack

| Layer    | Tech |
|----------|------|
| Backend  | FastAPI · Python |
| Models   | CLIP (ViT-B/32) + DINOv2 (ViT-B/14) |
| Frontend | React · Vite |
| Data     | Image dataset + JSON + NumPy index |
| Deploy   | Docker (optional) |

---

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm

### 1. Clone the repository

```sh
git clone <your-repo-url>
cd Spare_Part_Recognition
```

### 2. Prepare the Dataset

Add material images (not included):

```
data/hwl_images/<material_id>/image_1.png
```



### 4. Backend Setup

```sh
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 5. Frontend Setup

```sh
cd frontend
npm install
npm run dev
```

### 6. Open the App

- Frontend: http://localhost:5174
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Project Structure

```
Spare_Part_Recognition/
├── backend/
│   ├── main.py
│   ├── clip_engine.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── data/
│   ├── hwl_images/
│   ├── hwl_dataset.json
│   ├── hwl_descriptions.json
│   └── hwl_clip_index.npz

├── docker-compose.yml
└── README.md
```

---

## API Reference

| Method | Endpoint               | Description         |
|--------|------------------------|---------------------|
| POST   | `/api/query`           | Search parts        |
| GET    | `/api/materials`       | List materials      |
| GET    | `/api/material/{id}`   | Material details    |
| GET    | `/api/image/{id}`      | Get image           |
| POST   | `/api/index/rebuild`   | Rebuild index       |
| GET    | `/api/health`          | Health check        |
| GET    | `/docs`                | Swagger UI          |

---

## Notes

- Dataset images (must be added manually)
- Descriptions and excel file already added 
- Indexes also added for all materials 

---

## Author

Ajay Sawandkar  
Computer Engineering Student

---

## License

This project is licensed under the MIT License.