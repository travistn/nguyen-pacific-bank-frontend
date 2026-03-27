# Nguyen Pacific Bank Frontend

A modern web application for a banking platform built with Next.js.  
Allows users to manage accounts, view transactions, and perform transfers through a responsive UI.

## Full Stack Application

- 🌐 Frontend Web App (this repo)
- 🔧 Backend API: [Nguyen Pacific Bank API](https://github.com/travistn/nguyen-pacific-bank-api)

## Features

- User registration and login
- Authentication with HTTP-only cookies
- Dashboard with checking and savings accounts
- View account details and balances
- View recent transactions
- Transaction history with filtering
- Create deposits, withdrawals, and transfers
- Protected routes for authenticated users
- Responsive, mobile-first design

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Lucide React
- Custom API client (`apiFetch`)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/travistn/nguyen-pacific-bank-frontend.git
cd nguyen-pacific-bank-frontend
```

### 2. Configure environment variables

Create a .env.local file:

``` env
NEXT_PUBLIC_API_URL=http://localhost:8080
```


### 3. Run the application
```
npm install
npm run dev
```

The app will run at:

```
http://localhost:3000
```


### Application Overview

### Public Pages
- `/login`
- `/register`

### Protected Pages
- `/dashboard` — account overview
- `/dashboard/accounts/[id]` — account details
- `/transactions` — create and view transactions


### Authentication
- Uses HTTP-only cookies for secure authentication
- Middleware protects dashboard routes
- Unauthorized users are redirected to `/login`


### Notes
- Designed with a mobile-first approach
- Centralized API requests using `apiFetch`
- Built to simulate real-world banking workflows
