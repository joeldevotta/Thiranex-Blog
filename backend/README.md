# Thiranex Blog API

FastAPI + MongoDB backend for the existing Chronicle/Thiranex Blog frontend.

## Run locally

From the `backend` directory:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env`, then add your MongoDB URI and JWT secret.

Start the API:

```bash
uvicorn app:app --reload --port 8000
```

Open `http://localhost:8000/docs` for Swagger API testing.

## API

Auth:
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

Posts:
- GET `/api/posts`
- GET `/api/posts/{id}`
- POST `/api/posts`
- PUT `/api/posts/{id}`
- DELETE `/api/posts/{id}`

Comments:
- GET `/api/posts/{id}/comments`
- POST `/api/posts/{id}/comments`
- PUT `/api/comments/{id}`
- DELETE `/api/comments/{id}`

Protected routes use:

`Authorization: Bearer <JWT>`

MongoDB collections are `users`, `posts`, and `comments`.
