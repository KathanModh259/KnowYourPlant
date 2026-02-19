# KnowYourPlant — Plant Scanner

A full-stack plant identification app built with **FastAPI** (backend) and **React + Vite** (frontend).

---

## Project Structure

```
plant-scanner/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app, routes
│   │   ├── model.py       # SQLAlchemy ORM models
│   │   ├── auth.py        # JWT auth utilities
│   │   ├── database.py    # DB engine & session
│   │   └── schemas.py     # Pydantic schemas
│   └── requirements.txt
│
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── api/           # Axios API helpers
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── context/       # Auth context
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## Backend Setup

```bash
cd plant-scanner/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create a .env file
echo SECRET_KEY=your-super-secret-key > .env
echo DATABASE_URL=sqlite:///./plant_scanner.db >> .env

# Run the server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

## Frontend Setup

```bash
cd plant-scanner/frontend

npm install
npm run dev
```

App runs at: http://localhost:5173

---

## API Endpoints

| Method | Endpoint          | Auth | Description                  |
|--------|-------------------|------|------------------------------|
| POST   | `/auth/register`  | No   | Register a new user          |
| POST   | `/auth/login`     | No   | Login, receive JWT token     |
| GET    | `/auth/me`        | Yes  | Get current user info        |
| POST   | `/scan`           | Yes  | Upload image, identify plant |
| GET    | `/history`        | Yes  | Get user's scan history      |
| GET    | `/health`         | No   | Health check                 |

---

## Environment Variables

Create `backend/.env`:

```
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=sqlite:///./plant_scanner.db
```
