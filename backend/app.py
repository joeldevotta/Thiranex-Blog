import os
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pymongo import MongoClient, ASCENDING
from passlib.context import CryptContext
import jwt
from pydantic import BaseModel, Field, EmailStr

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "thiranex_blog")
JWT_SECRET = os.getenv("JWT_SECRET", "change-this-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users = db.users
posts = db.posts
comments = db.comments

users.create_index("email", unique=True)
posts.create_index([("created_at", -1)])
comments.create_index([("post_id", ASCENDING), ("created_at", ASCENDING)])

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer(auto_error=False)

app = FastAPI(title="Thiranex Blog API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class PostIn(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    content: str = Field(min_length=1)
    excerpt: str = Field(default="", max_length=500)
    category: str = Field(default="General", max_length=60)
    cover_image: str = ""
    tags: list[str] = Field(default_factory=list, max_length=10)

class CommentIn(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
    parent_id: str | None = None

def oid(value: str):
    if not ObjectId.is_valid(value):
        raise HTTPException(400, "Invalid ID")
    return ObjectId(value)

def public_user(user):
    return {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}

def serialize_post(p):
    return {
        "id": str(p["_id"]),
        "title": p["title"],
        "content": p["content"],
        "excerpt": p.get("excerpt", ""),
        "category": p.get("category", "General"),
        "cover_image": p.get("cover_image", ""),
        "tags": p.get("tags", []),
        "author": p.get("author", {}),
        "created_at": p["created_at"].isoformat(),
        "updated_at": p["updated_at"].isoformat(),
    }

def serialize_comment(c):
    return {
        "id": str(c["_id"]),
        "post_id": str(c["post_id"]),
        "parent_id": str(c["parent_id"]) if c.get("parent_id") else None,
        "content": c["content"],
        "author": c["author"],
        "created_at": c["created_at"].isoformat(),
    }

def make_token(user_id: ObjectId):
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    if not credentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Authentication required")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = users.find_one({"_id": oid(payload["sub"])})
    except (jwt.PyJWTError, KeyError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user

@app.get("/")
def root():
    return {"name": "Thiranex Blog API", "status": "ok"}

@app.get("/api/health")
def health():
    client.admin.command("ping")
    return {"status": "ok", "database": DB_NAME}

@app.post("/api/auth/register", status_code=201)
def register(data: RegisterIn):
    email = data.email.lower()
    if users.find_one({"email": email}):
        raise HTTPException(409, "Email already registered")
    user = {
        "name": data.name.strip(),
        "email": email,
        "password_hash": pwd.hash(data.password),
        "created_at": datetime.now(timezone.utc),
    }
    result = users.insert_one(user)
    user["_id"] = result.inserted_id
    return {"token": make_token(result.inserted_id), "user": public_user(user)}

@app.post("/api/auth/login")
def login(data: LoginIn):
    user = users.find_one({"email": data.email.lower()})
    if not user or not pwd.verify(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    return {"token": make_token(user["_id"]), "user": public_user(user)}

@app.get("/api/auth/me")
def me(user=Depends(current_user)):
    return {"user": public_user(user)}

@app.get("/api/users/{user_id}")
def get_user(user_id: str):
    user = users.find_one({"_id": oid(user_id)})
    if not user:
        raise HTTPException(404, "User not found")
    return public_user(user)

@app.get("/api/posts")
def list_posts(skip: int = 0, limit: int = 20):
    limit = min(max(limit, 1), 50)
    return [serialize_post(p) for p in posts.find().sort("created_at", -1).skip(skip).limit(limit)]

@app.get("/api/posts/{post_id}")
def get_post(post_id: str):
    post = posts.find_one({"_id": oid(post_id)})
    if not post:
        raise HTTPException(404, "Post not found")
    return serialize_post(post)

@app.post("/api/posts", status_code=201)
def create_post(data: PostIn, user=Depends(current_user)):
    now = datetime.now(timezone.utc)
    author = {"id": str(user["_id"]), "name": user["name"]}
    doc = data.model_dump() | {"author": author, "created_at": now, "updated_at": now}
    result = posts.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_post(doc)

@app.put("/api/posts/{post_id}")
def update_post(post_id: str, data: PostIn, user=Depends(current_user)):
    post = posts.find_one({"_id": oid(post_id)})
    if not post:
        raise HTTPException(404, "Post not found")
    if str(post["author"]["id"]) != str(user["_id"]):
        raise HTTPException(403, "You can only edit your own posts")
    now = datetime.now(timezone.utc)
    posts.update_one({"_id": post["_id"]}, {"$set": data.model_dump() | {"updated_at": now}})
    post.update(data.model_dump())
    post["updated_at"] = now
    return serialize_post(post)

@app.delete("/api/posts/{post_id}")
def delete_post(post_id: str, user=Depends(current_user)):
    post = posts.find_one({"_id": oid(post_id)})
    if not post:
        raise HTTPException(404, "Post not found")
    if str(post["author"]["id"]) != str(user["_id"]):
        raise HTTPException(403, "You can only delete your own posts")
    posts.delete_one({"_id": post["_id"]})
    comments.delete_many({"post_id": post["_id"]})
    return {"message": "Post deleted"}

@app.get("/api/posts/{post_id}/comments")
def list_comments(post_id: str):
    post_oid = oid(post_id)
    if not posts.find_one({"_id": post_oid}, {"_id": 1}):
        raise HTTPException(404, "Post not found")
    return [serialize_comment(c) for c in comments.find({"post_id": post_oid}).sort("created_at", 1)]

@app.post("/api/posts/{post_id}/comments", status_code=201)
def create_comment(post_id: str, data: CommentIn, user=Depends(current_user)):
    post_oid = oid(post_id)
    if not posts.find_one({"_id": post_oid}, {"_id": 1}):
        raise HTTPException(404, "Post not found")
    parent = oid(data.parent_id) if data.parent_id else None
    if parent and not comments.find_one({"_id": parent, "post_id": post_oid}):
        raise HTTPException(400, "Parent comment does not belong to this post")
    doc = {
        "post_id": post_oid,
        "parent_id": parent,
        "content": data.content.strip(),
        "author": {"id": str(user["_id"]), "name": user["name"]},
        "created_at": datetime.now(timezone.utc),
    }
    result = comments.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_comment(doc)

@app.put("/api/comments/{comment_id}")
def update_comment(comment_id: str, data: CommentIn, user=Depends(current_user)):
    comment = comments.find_one({"_id": oid(comment_id)})
    if not comment:
        raise HTTPException(404, "Comment not found")
    if str(comment["author"]["id"]) != str(user["_id"]):
        raise HTTPException(403, "You can only edit your own comments")
    comments.update_one({"_id": comment["_id"]}, {"$set": {"content": data.content.strip()}})
    comment["content"] = data.content.strip()
    return serialize_comment(comment)

@app.delete("/api/comments/{comment_id}")
def delete_comment(comment_id: str, user=Depends(current_user)):
    comment = comments.find_one({"_id": oid(comment_id)})
    if not comment:
        raise HTTPException(404, "Comment not found")
    if str(comment["author"]["id"]) != str(user["_id"]):
        raise HTTPException(403, "You can only delete your own comments")
    doomed = {comment["_id"]}
    changed = True
    while changed:
        changed = False
        for child in comments.find({"parent_id": {"$in": list(doomed)}}, {"_id": 1}):
            if child["_id"] not in doomed:
                doomed.add(child["_id"])
                changed = True
    comments.delete_many({"_id": {"$in": list(doomed)}})
    return {"message": "Comment deleted"}
