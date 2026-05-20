# 🎬 ViralAI - AI Content Generator SaaS Platform

> Enterprise-grade AI-powered short video content generator for TikTok, YouTube Shorts, Instagram Reels, and Facebook Reels.

## 🚀 Overview

ViralAI is a premium SaaS platform that helps creators and businesses generate viral short-form video content automatically using AI. From script generation to video rendering and multi-platform publishing — all automated.

## 🏗️ Architecture

```
├── frontend/          → Next.js 14 App (Dashboard, Auth, Landing)
├── backend/           → NestJS API Server (REST + WebSocket)
├── worker/            → BullMQ Workers (Video Rendering, Upload)
├── ai-engine/         → AI Services (OpenAI, TTS, Whisper)
├── ffmpeg-engine/     → Video Processing (FFmpeg, Rendering)
├── uploader-service/  → Multi-Platform Upload Service
├── analytics-service/ → Analytics & Metrics Collection
├── shared/            → Shared Types, Utils, Constants
├── prisma/            → Database Schema & Migrations
├── docker/            → Docker Compose & Dockerfiles
└── docs/              → Documentation
```

## ✨ Key Features

- **AI Content Generator** — Scripts, hooks, captions, hashtags, titles
- **AI Video Generator** — Text-to-video with auto subtitles, voiceover, B-roll
- **Trend Analyzer** — Viral prediction, hashtag analysis, competitor tracking
- **Social Media Manager** — Multi-account, scheduling, bulk upload
- **Analytics Dashboard** — Views, engagement, growth, AI recommendations
- **Template System** — Reusable video templates and brand presets
- **Media Library** — Asset management with drag-and-drop
- **AI Workflow Automation** — End-to-end content pipeline
- **Subscription System** — Free, Starter, Pro, Agency plans

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Shadcn UI |
| Backend | NestJS, Node.js, PostgreSQL, Redis, Prisma ORM, BullMQ |
| AI | OpenAI GPT-4, Whisper, TTS, Custom Models |
| Video | FFmpeg, Sharp, Canvas |
| Auth | JWT, OAuth2 (Google), Email Verification |
| Deploy | Docker, Vercel, Railway, AWS, VPS |

## 📦 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- FFmpeg 6+
- Docker (optional)

### Environment Setup

```bash
# Clone repository
git clone https://github.com/your-org/viralai.git
cd viralai

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Setup database
npx prisma migrate dev

# Start development
npm run dev
```

### Docker Setup

```bash
docker-compose up -d
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Architecture Guide](./docs/architecture.md)
- [Contributing Guide](./docs/contributing.md)

## 📄 License

Proprietary - All rights reserved.
