# Records Management System

A comprehensive digital archiving system for managing and accessing records efficiently.

## Features

- User Authentication & Authorization
- Record Management
- Request Handling
- Activity Logging
- Email Notifications
- Automated Scheduling

## Project Structure

```
├── backend/           # Node.js/Express backend
│   ├── src/
│   │   ├── config/   # Database and app configuration
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/   # Database models
│   │   ├── routes/   # API routes
│   │   └── utils/    # Helper functions
│   └── package.json
│
└── frontend/         # React frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    └── package.json
```

## Getting Started

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Set up environment variables
4. Run the development servers

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create `.env` files in both frontend and backend directories with the necessary configurations.

## Contributing

Please request to do so before submitting pull requests.
