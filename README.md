# FinTrack Wallet

FinTrack Wallet is a freelance-ready Java + React + Docker portfolio project. It is a demo wallet and expense tracker with JWT auth, wallet balance, credit/debit transactions, search, transaction editing, animated analytics graphs, PostgreSQL persistence, and explicit LLD patterns.

## Tech Stack

- Backend: Java 17, Spring Boot, Spring Security, Spring Data JPA
- Frontend: React, Vite, lucide-react
- Database: PostgreSQL
- DevOps: Docker Compose
- LLD patterns: Strategy Pattern, Factory Pattern

## Project Structure

```text
fintrack-wallet/
  backend/              Spring Boot REST API
  frontend/             React dashboard
  docs/LLD.md           Low-level design notes
  docker-compose.yml    PostgreSQL + backend + frontend
```

## Run With Docker

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

## Backend APIs

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/wallet
POST /api/wallet/transactions
PUT  /api/wallet/transactions/{transactionId}
```

## Sample Transaction Request

```json
{
  "type": "CREDIT",
  "amount": 1000,
  "category": "Salary",
  "note": "Initial deposit"
}
```

## Why This Is Good For Freelance Portfolio

- Shows full-stack capability.
- Shows practical business use case.
- Shows authentication and secure API design.
- Shows Dockerized deployment.
- Shows LLD understanding through Strategy and Factory patterns.

## Git Commands

```bash
git init
git add .
git commit -m "Initial FinTrack Wallet project"
```
