# ViralAI API Documentation

## Base URL
```
Production: https://api.viralai.com/api/v1
Development: http://localhost:4000/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### POST /auth/register
Register a new user account.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### POST /auth/login
Login with email and password.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": { "id": "...", "email": "...", "name": "...", "role": "USER" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### GET /auth/google
Initiate Google OAuth login.

### POST /auth/refresh
Refresh access token.

### POST /auth/forgot-password
Request password reset email.

### POST /auth/reset-password
Reset password with token.

---

## AI Generation Endpoints

### POST /ai/generate/script
Generate a viral video script.

**Body:**
```json
{
  "niche": "tech",
  "topic": "AI tools replacing jobs",
  "tone": "engaging",
  "duration": 30,
  "platform": "TIKTOK",
  "language": "English"
}
```

### POST /ai/generate/hook
Generate attention-grabbing hooks.

### POST /ai/generate/caption
Generate optimized captions.

### POST /ai/generate/hashtags
Generate trending hashtags.

### POST /ai/predict/viral-score
Predict viral potential of content.

### POST /ai/rewrite
Rewrite and optimize content.

---

## Video Endpoints

### POST /videos
Create and queue video for rendering.

### GET /videos
Get user's videos (paginated).

### GET /videos/:id
Get video details.

### GET /videos/:id/progress
Get render progress.

### DELETE /videos/:id
Delete a video.

### POST /videos/batch-render
Queue multiple videos for rendering.

---

## Upload Endpoints

### POST /uploads/schedule
Schedule a video upload.

### GET /uploads/queue
Get upload queue.

### PUT /uploads/:id/cancel
Cancel a pending upload.

### POST /uploads/:id/retry
Retry a failed upload.

### POST /uploads/bulk
Upload to multiple platforms.

---

## Analytics Endpoints

### GET /analytics/dashboard
Get dashboard analytics summary.

### GET /analytics/platform?platform=TIKTOK
Get platform-specific analytics.

### GET /analytics/video/:id
Get video analytics.

### GET /analytics/growth?days=30
Get growth analytics.

### GET /analytics/best-times
Get best posting times.

---

## Trends Endpoints

### GET /trends/analyze?platform=TIKTOK&niche=tech
Analyze platform trends.

### GET /trends/hashtags?platform=TIKTOK
Get viral hashtags.

### POST /trends/competitor
Analyze competitor strategy.

---

## Projects Endpoints

### POST /projects
Create new project.

### GET /projects
Get all projects.

### GET /projects/:id
Get project details.

### PUT /projects/:id
Update project.

### DELETE /projects/:id
Delete project.

---

## Social Accounts Endpoints

### POST /social-accounts/connect
Connect a social media account.

### GET /social-accounts
Get connected accounts.

### DELETE /social-accounts/:id
Disconnect account.

---

## Subscription Endpoints

### GET /subscription/current
Get current subscription plan.

### POST /subscription/checkout
Create Stripe checkout session.

---

## Schedules Endpoints

### POST /schedules
Create schedule.

### GET /schedules/calendar?month=3&year=2024
Get content calendar.

---

## Templates Endpoints

### GET /templates
Get all templates.

### GET /templates/:id
Get template details.

---

## Media Endpoints

### POST /media/upload
Upload media asset (multipart/form-data).

### GET /media/assets
Get user media assets.

### POST /media/folders
Create folder.

### GET /media/folders
Get folders.

---

## Workflows Endpoints

### POST /workflows
Create and execute workflow.

**Body:**
```json
{
  "name": "Full Content Pipeline",
  "steps": [
    { "type": "generate_script", "config": { "niche": "tech" } },
    { "type": "generate_video", "config": {} },
    { "type": "render", "config": { "quality": "high" } },
    { "type": "schedule", "config": { "platform": "TIKTOK" } },
    { "type": "publish", "config": {} }
  ]
}
```

---

## Admin Endpoints (Admin only)

### GET /admin/stats
### GET /admin/users
### PUT /admin/users/:id/toggle
### GET /admin/queues

---

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per user
