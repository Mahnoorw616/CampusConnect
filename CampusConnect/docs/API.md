# CampusCrew API

Base URL: `http://localhost:5000/api`

## Public routes

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`

Registration fields: `name`, `email`, `password`, `university`, `batchYear`, `whatsappNumber`.

## Protected routes

Use `Authorization: Bearer YOUR_JWT_TOKEN`.

- `GET /posts?uni=FAST` — list posts, optionally filtered by university.
- `POST /posts` — create `{ title, content, universityTag }`.
- `POST /posts/:id/comment` — add `{ text }` as the authenticated user.
- `POST /posts/:id/upvote` — toggle the authenticated user's upvote.

Calling the upvote endpoint once adds an upvote; calling it again removes that user's upvote.
