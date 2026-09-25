# CampusConnect — Complete Backend Project

This archive contains the working backend for the CampusConnect hackathon MVP.

## Implemented

- Express.js backend
- MongoDB Atlas/Mongoose connection
- User model and registration/login
- bcrypt password hashing
- JWT creation and protected-route verification
- Post model with title, content, authorId, universityTag, upvotesCount, comments, and upvote tracking
- University-filtered post listing: `GET /api/posts?uni=FAST`
- Authenticated post creation: `POST /api/posts`
- Flat comments: `POST /api/posts/:id/comment`
- Toggle upvotes: `POST /api/posts/:id/upvote`
- Environment configuration through `.env`

## Structure

```text
CampusConnect/
├── README.md
├── .gitignore
├── docs/API.md
├── frontend/README.md
└── backend/
    ├── .env.example
    ├── .gitignore
    ├── package.json
    └── src/
        ├── app.js
        ├── server.js
        ├── config/db.js
        ├── constants/universities.js
        ├── controllers/authController.js
        ├── controllers/postController.js
        ├── middleware/authMiddleware.js
        ├── middleware/errorMiddleware.js
        ├── models/User.js
        ├── models/Post.js
        ├── routes/authRoutes.js
        └── routes/postRoutes.js
```

## Setup in Antigravity

### 1. Open the project

Extract the archive and open the `CampusConnect` folder in Antigravity. Open its integrated terminal:

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

Node.js 18.18 or newer is required.

### 3. Create MongoDB Atlas M0

1. Sign in to MongoDB Atlas.
2. Create a free M0 cluster.
3. Create a database user under **Database Access**.
4. Add your current IP under **Network Access**.
5. Choose **Connect → Drivers**, select Node.js, and copy the connection string.
6. Use `campusconnect` as the database name.

For a temporary hackathon test, `0.0.0.0/0` can be used with a strong password, but restrict it before production. URL-encode special characters in the Atlas username or password.

### 4. Configure `.env`

From `backend`:

```bash
cp .env.example .env
```

Set the values:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/campusconnect?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

Never commit `.env` or share `JWT_SECRET`.

### 5. Validate and start

```bash
npm run check
npm run dev
```

Expected startup output:

```text
MongoDB connected
CampusConnect API listening on port 5000
```

### 6. Test the health route

In a second terminal:

```bash
curl http://localhost:5000/api/health
```

### 7. Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ayesha Khan","email":"ayesha@example.com","password":"Campus123!","university":"FAST","batchYear":2028,"whatsappNumber":"+923001234567"}'
```

Copy the returned `token`.

### 8. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ayesha@example.com","password":"Campus123!"}'
```

### 9. Create a post

Replace `YOUR_TOKEN`:

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Which CS electives are best?","content":"Please share your experience.","universityTag":"FAST"}'
```

Copy the post `_id` from the response.

### 10. Filter posts

```bash
curl "http://localhost:5000/api/posts?uni=FAST" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Omit `?uni=FAST` to retrieve all posts.

### 11. Add a flat comment

```bash
curl -X POST http://localhost:5000/api/posts/POST_ID/comment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text":"I recommend this course."}'
```

### 12. Toggle an upvote

```bash
curl -X POST http://localhost:5000/api/posts/POST_ID/upvote \
  -H "Authorization: Bearer YOUR_TOKEN"
```

The first call adds the upvote; the second call removes it.

## Troubleshooting

- `MONGO_URI is not configured`: create `backend/.env` and restart.
- `bad auth`: verify Atlas credentials and URL-encode special characters.
- `IP not allowed`: add your IP in Atlas Network Access.
- `Invalid or expired token`: log in again and resend the Bearer token.
- `EADDRINUSE`: change `PORT` or stop the process using port 5000.
- CORS errors: set `CLIENT_ORIGIN` to the exact frontend origin.
