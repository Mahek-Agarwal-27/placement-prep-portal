# HireNova AI — Your AI-Powered Placement Companion 🚀

> An all-in-one platform for students preparing for campus placements — featuring DSA Tracker, Study Planner, Resume Analyzer, AI-Powered Roadmaps, and Interview Preparation.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React (Vite), Tailwind CSS, Recharts |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB Atlas                       |
| Auth       | JWT + bcryptjs                      |
| AI         | Google Gemini API                   |
| Deployment | Vercel (client) + Render (server)   |

---

## Project Structure

```
placement-prep-portal/
├── client/          ← React + Vite + Tailwind frontend
├── server/          ← Express + MongoDB backend
├── screenshots/     ← App screenshots
├── docs/            ← Additional documentation
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account
- Google Gemini API key

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd placement-prep-portal
```

### 2. Setup the Backend
```bash
cd server
npm install
# Edit .env with your MongoDB URI, JWT secret, and Gemini API key
npm run dev
```

### 3. Setup the Frontend
```bash
cd client
npm install
npm run dev
```

The client runs on **http://localhost:5173**
The server runs on **http://localhost:5000**

---

## Environment Variables

### server/.env
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/placement-prep-portal
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

---

## Features

- 🔐 JWT Authentication (Signup / Login / Protected Routes)
- 📊 Dashboard with Statistics & Progress Charts
- 💻 DSA Tracker with topic-wise analytics
- 📅 Study Planner with calendar view
- 📁 Notes Upload & Download
- 📄 Resume Analyzer with ATS Score
- 🎯 Interview Preparation (company & subject-wise)
- 🤖 AI Roadmap & Study Plan Generator (Gemini)
- 📈 Analytics Dashboard

---

## Build Status

| Phase | Feature                                  | Status    |
|-------|------------------------------------------|-----------|
| 1     | Project Setup                            | ✅ Done   |
| 2     | Authentication (JWT & Protected Routes)  | ✅ Done   |
| 3     | Profile & Dashboard                      | ✅ Done   |
| 4     | DSA Tracker                              | ✅ Done   |
| 5     | Study Planner                            | ✅ Done   |
| 6     | AI-Integrated Notes (Gemini)             | ✅ Done   |
| 7     | AI Resume Analyzer (pdf-parse + Gemini)  | ✅ Done   |
| 8     | AI Mock Interview Room (Gemini)          | ✅ Done   |
| 9     | Performance Analytics (Recharts)         | ✅ Done   |
| 10    | Final Documentation & Local Deployment   | ✅ Done   |

---

## License
MIT
