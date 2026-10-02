# Thiranex Blog

A full-stack blogging platform with user authentication, blog post management, and comments.

## Live Review

**Frontend:** https://thiranex-blog-5ych.vercel.app/

**Backend API:** https://thiranex-blog.onrender.com/

**API Docs:** https://thiranex-blog.onrender.com/docs

## Stack

- Frontend: Next.js + React + Tailwind CSS
- Backend: Python + FastAPI
- Database: MongoDB
- Authentication: JWT + bcrypt
- Deployment: Vercel frontend + Render API + MongoDB Atlas

## Assignment Features

- User registration and login
- JWT authentication
- Create, edit, and delete blog posts
- Persistent comments and nested replies
- RESTful API endpoints
- MongoDB database integration
- Responsive blog interface
- Search and category filtering

## Backend

See [backend/README.md](backend/README.md).

The backend provides:

- user registration and login
- JWT authentication
- authenticated blog post CRUD
- persistent comments and nested replies
- MongoDB persistence
- public user lookup
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

Set the frontend environment variable:

```text
NEXT_PUBLIC_API_URL=https://thiranex-blog.onrender.com/api
```

For local development, use:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

The frontend stores the JWT returned by login and sends it as:

```text
Authorization: Bearer <token>
```

Never commit MongoDB credentials or JWT secrets.
