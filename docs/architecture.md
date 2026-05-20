# ViralAI Architecture Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Web App │  │ Mobile   │  │   API    │  │  Admin   │       │
│  │ (Next.js)│  │  (PWA)   │  │ Clients  │  │  Panel   │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼──────────────┼──────────────┼──────────────┼────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER (Nginx/ALB)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  API Server  │  │  API Server  │  │  API Server  │
│   (NestJS)   │  │   (NestJS)   │  │   (NestJS)   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │    Redis     │  │   Storage    │
│  (Database)  │  │ (Cache/Queue)│  │  (S3/Local)  │
└──────────────┘  └──────┬───────┘  └──────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Video Render │  │   Upload     │  │  AI Engine   │
│   Workers    │  │   Workers    │  │   Workers    │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Module Architecture

### Backend (NestJS)
```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── prisma/                    # Database service
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── modules/
    ├── auth/                  # Authentication & Authorization
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── strategies/        # Passport strategies
    │   ├── guards/            # Auth guards
    │   ├── dto/               # Data transfer objects
    │   └── email.service.ts
    ├── users/                 # User management
    ├── projects/              # Project management
    ├── ai/                    # AI content generation
    │   ├── ai.module.ts
    │   ├── ai.controller.ts
    │   ├── ai.service.ts
    │   ├── services/          # Individual AI services
    │   └── processors/        # BullMQ processors
    ├── videos/                # Video management & rendering
    ├── upload/                # Upload queue management
    ├── analytics/             # Analytics & metrics
    ├── schedules/             # Content scheduling
    ├── templates/             # Video templates
    ├── media/                 # Media library
    ├── notifications/         # Notification system
    ├── subscription/          # Billing & subscriptions
    ├── social-accounts/       # Social media connections
    ├── admin/                 # Admin panel
    ├── workflow/              # Workflow automation
    └── trends/                # Trend analysis
```

## Data Flow

### Content Generation Flow
```
User Input → AI Service → Script Generation → Video Rendering → Upload Queue → Platform Publishing
     │                          │                    │                │
     ▼                          ▼                    ▼                ▼
  Validation            OpenAI GPT-4          FFmpeg Engine      Platform APIs
                                                    │
                                              ┌─────┼─────┐
                                              ▼     ▼     ▼
                                           Voice  Subtitle  B-roll
                                           (TTS)  (Whisper) (Stock)
```

### Queue Architecture
```
BullMQ Queues:
├── ai-jobs          → AI content generation tasks
├── video-render     → FFmpeg video rendering
├── upload-queue     → Platform upload tasks
└── workflow         → Multi-step workflow execution
```

## Security Architecture

- **Authentication**: JWT + Refresh Token rotation
- **Authorization**: Role-based (USER, ADMIN, SUPER_ADMIN)
- **Rate Limiting**: Per-IP and per-user throttling
- **Input Validation**: class-validator + whitelist
- **CORS**: Strict origin policy
- **Helmet**: Security headers
- **File Upload**: Type validation + size limits
- **API Keys**: Encrypted storage for social tokens

## Scalability Considerations

1. **Stateless API** — Horizontal scaling with load balancer
2. **Queue-based Processing** — Decouple heavy tasks
3. **Redis Caching** — Reduce database load
4. **CDN** — Serve static assets and rendered videos
5. **Database Indexing** — Optimized queries
6. **Connection Pooling** — Efficient DB connections
7. **Microservice-ready** — Each service can be extracted
