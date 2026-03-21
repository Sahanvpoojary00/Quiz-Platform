# Technical Quiz Platform

## Overview
A comprehensive, full-stack Technical Quiz Platform built with Next.js, Python (FastAPI), PostgreSQL, and Docker. Features include multiple quiz rounds, a secure Python code execution environment, strict anti-cheating mechanisms, and robust User & Admin dashboards.

## Architecture
- **Frontend & Main Backend**: Next.js 15 (App Router) + Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Code Execution**: Python FastAPI service using subprocess for code evaluation
- **Containerization**: Docker Compose orchestrates the entire stack effortlessly

## Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

## Setup Instructions

### 1. Database Setup
Ensure you seed the database schema locally before starting the app:
```bash
cd web
npm install
npx prisma db push
```

### 2. Start the Environment
Run the entire stack (Database, Next.js Web App, Python Executor) using Docker Compose from the root directory:
```bash
cd ..
docker-compose up --build
```
*Note: Ensure Docker is running. The web application will be accessible at http://localhost:3000.*

### 3. Usage & Testing
- **User Access**: Go to [http://localhost:3000/login](http://localhost:3000/login) and log in with any standard email (e.g., `user@test.com`) to begin the quiz as a participant.
- **Admin Access**: Log in with any email containing "admin" (e.g., `admin@test.com`) to access the Admin Command Center (`/admin`). Here you will find live participant monitoring, real-time cheating violation logs, and analytics.

## Anti-Cheating Features
If a participant switches tabs, attempts to use Developer Tools, or copies/pastes content, it will immediately be logged to the database and reflected in the Admin Cheating Logs panel with high priority urgency.
