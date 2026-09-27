# CampusCrew API

Base URL: `http://localhost:5000/api`

All protected routes require:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

Supported university values:

- `UOG`
- `ILM`
- `Superior`
- `UOC`
- `Swedish`
- `UOP`
- `Other`

## Public routes

### Health

```text
GET /health
```

### Register

```text
POST /auth/register
```

Body:

```json
{
  "name": "Ayesha Khan",
  "email": "ayesha@example.com",
  "password": "Campus123!",
  "university": "UOG",
  "batchYear": 2028,
  "whatsappNumber": "+923001234567"
}
```

### Login

```text
POST /auth/login
```

Body:

```json
{
  "email": "ayesha@example.com",
  "password": "Campus123!"
}
```

## Protected post routes

### List posts

```text
GET /posts?page=1&limit=20&uni=UOG&category=General
```

Supported categories:

- `Admissions`
- `Course Review`
- `General`

The response includes `total`, `page`, `limit`, and `pages` pagination metadata.

### Create a post

```text
POST /posts
```

Body:

```json
{
  "title": "Which CS electives are best?",
  "content": "Please share your experience.",
  "universityTag": "UOG",
  "category": "General",
  "mediaUrl": ""
}
```

`mediaUrl` may be an HTTPS URL or a supported Base64 image/video data URL. Base64 files are stored in MongoDB GridFS and the post stores only the generated media URL.

### Update a post

```text
PUT /posts/:id
```

Any supplied field is updated. The authenticated user must own the post.

### Delete a post

```text
DELETE /posts/:id
```

The authenticated user must own the post. Related reactions, comment reactions, and GridFS media are cleaned up.

### Toggle a post reaction

```text
POST /posts/:id/react
```

Body:

```json
{
  "reactionType": "Helpful"
}
```

Supported reaction types:

- `Relatable`
- `Helpful`
- `Support`
- `Vibe`

The operation is transactional and one user can have at most one reaction per post.

## Protected comment routes

### Add a comment

```text
POST /posts/:id/comment
```

Body:

```json
{
  "text": "I recommend this course."
}
```

### Update a comment

```text
PUT /posts/:postId/comments/:commentId
```

Body:

```json
{
  "text": "Updated comment text"
}
```

The authenticated user must own the comment.

### Delete a comment

```text
DELETE /posts/:postId/comments/:commentId
```

The authenticated user must own the comment.

### Toggle a comment reaction

```text
POST /posts/:postId/comments/:commentId/react
```

Body:

```json
{
  "reactionType": "Helpful"
}
```

### Add a reply

```text
POST /posts/:postId/comments/:commentId/reply
```

Body:

```json
{
  "text": "This helped me too."
}
```

Comments support up to 50 replies and posts support up to 500 comments.

## Protected marketplace routes

### List marketplace items

```text
GET /marketplace?page=1&limit=20&uni=UOG
```

The response includes pagination metadata.

### Create a listing

```text
POST /marketplace
```

Body fields:

- `title`
- `courseName`
- `courseCode`
- `pricePKR`
- `universityTag`
- `description`
- `driveLink` (optional HTTPS Google link)
- `coverImage` (optional HTTPS URL or Base64 image data URL)

Base64 cover images are stored in MongoDB GridFS and only the generated URL is stored in the listing.

### Delete a listing

```text
DELETE /marketplace/:id
```

Only the seller can delete their listing. Stored GridFS cover media is also removed.

## Media route

```text
GET /media/:id
```

This route streams media stored in MongoDB GridFS. It is public so browser image and video elements can load it without attaching a Bearer token.

## Error behavior

- `400` invalid input or IDs
- `401` missing or invalid authentication
- `403` ownership violation
- `404` resource not found
- `409` duplicate unique record
- `413` request payload too large
- `429` rate limit exceeded
- `500` unexpected server error