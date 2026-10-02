# Thiranex Blog

Full-stack blogging platform using the existing Chronicle-style frontend and a Python/FastAPI + MongoDB backend.

## Stack

- Frontend: HTML + Tailwind CSS + JavaScript
- Backend: Python + FastAPI
- Database: MongoDB
- Authentication: JWT + bcrypt
- Deployment: Vercel frontend + Render API

## Backend

See [backend/README.md](backend/README.md).

The backend provides:

- user registration and login
- JWT authentication
- authenticated blog post CRUD
- persistent comments and nested replies
- MongoDB persistence
- CORS support for the frontend

## Run the API locally

From `backend/`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Set the variables from `backend/.env.example` before starting.

Swagger docs are available at `http://localhost:8000/docs`.

## Frontend integration

Use the deployed Render API as the frontend API base, for example:

`https://your-api.onrender.com/api`

Store the JWT returned by login and send it as:

`Authorization: Bearer <token>`

Never commit MongoDB credentials or JWT secrets.
