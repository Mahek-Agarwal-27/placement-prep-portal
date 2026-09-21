# HireNova AI — Next-Gen AI-Powered Placement Prep Platform 🚀

<div align="center">

![HireNova AI Banner](https://img.shields.io/badge/HireNova-AI_Career_Companion-6C47FF?style=for-the-badge&logo=sparkles&logoColor=white)

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Groq AI](https://img.shields.io/badge/Groq_AI-LLaMA_3.3_70B-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-Backend_Live-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

**An all-in-one AI career ecosystem designed to help students and developers master campus placements, algorithmic interviews, resume ATS scoring, and structured study planning.**

[🌐 Live Demo (Vercel)](https://placement-prep-portal-alpha.vercel.app) • [⚙️ Backend API (Render)](https://placement-prep-portal-v3w5.onrender.com)

</div>

---

## 🌟 Key Features

### 1. 💬 AI Interactive Chat Mock Interview Room
- Conversational chat-based AI mock interviews powered by ultra-low-latency **Groq LLaMA-3.3-70B**.
- Multi-domain interview topics: DSA, System Design, Full-Stack, OOPs, DBMS, OS, Behavioral, and HR rounds.
- Dynamic question-by-question technical evaluation with progressive follow-up questions.
- Comprehensive score breakdown, strengths analysis, and detailed feedback rating after each session.
- Manage active and past interview sessions with single & bulk deletion support.

### 2. 📄 AI Resume Intelligence & ATS Scanner
- Upload PDF resumes to receive instant **ATS Compatibility Scores (0-100%)**.
- Keyword matching against optional target Job Descriptions (JD).
- Detailed evaluation categorized into *Formatting*, *Keywords*, *Grammar*, and *Actionable Improvements*.
- Complete past scan history with one-click review and delete options.

### 3. ⚡ AI Smart Notes & Instant Study Assistant
- Markdown-enabled rich note-taking editor with folder categorization and tag filters.
- Integrated AI assistant providing instant concept summaries, key takeaways, and flashcard generation.
- Manage notes with single note deletion and **Clear All** capabilities.

### 4. 💻 DSA Problem & Progress Tracker
- Log solved problems across LeetCode, Codeforces, GeeksforGeeks, and HackerRank.
- Filter and search by topic, difficulty (*Easy*, *Medium*, *Hard*), and completion status.
- Real-time difficulty breakdown charts and solved question metrics.

### 5. 📅 Study Planner & Focus Tracker
- Task management system with priorities, categories, and deadlines.
- Real-time study duration logging with streak tracking to maintain study habits.
- Today's Focus recommendation engine suggesting highest-impact preparation activities.

### 6. 📊 Progress & Placement Analytics
- Unified interactive dashboard with charts powered by **Recharts**.
- Visual tracking of DSA difficulty distributions, study task completion rates, ATS resume score progression, and mock interview trends.
- **Customizable Reset Analytics**: Selectively or entirely reset progress and recalibrate analytics.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18 (Vite), Vanilla CSS, Tailwind CSS, Lucide Icons | Responsive UI with rich animations, dark/purple theme |
| **Data Viz** | Recharts | Interactive pie charts, bar charts, and trend line charts |
| **Backend** | Node.js, Express.js | Scalable RESTful API with modular controllers and middlewares |
| **Database** | MongoDB Atlas (Mongoose ODM) | Cloud NoSQL database for users, questions, tasks, notes, scans & interviews |
| **AI Engine** | Groq SDK (`llama-3.3-70b-versatile`) | Ultra-fast inference for mock interviews, resume analysis & study notes |
| **Authentication** | JWT (JSON Web Tokens) & bcryptjs | Secure password hashing, HTTP bearer token authorization |
| **File Processing**| Multer, `pdf-parse` | Secure multipart PDF upload and server-side text extraction |
| **Deployment** | Vercel (Client) + Render (Server) | CI/CD auto-deployments linked with GitHub repository |

---

## 📁 Repository Structure

```text
placement-prep-portal/
├── client/                      # React 18 + Vite Frontend
│   ├── public/                  # Static assets & favicon
│   ├── src/
│   │   ├── components/          # Reusable UI components (Navbar, Sidebar, Logo, etc.)
│   │   ├── pages/               # Application views (Dashboard, DSA, Notes, Interview, Resume, Analytics)
│   │   ├── services/            # Axios API client modules
│   │   └── index.css            # Global styles and design tokens
│   ├── package.json
│   ├── vercel.json              # Vercel SPA routing rewrite rules
│   └── vite.config.js
│
├── server/                      # Express.js + Node.js Backend
│   ├── config/                  # Database connection (MongoDB Atlas)
│   ├── controllers/             # API controllers (Auth, AI, Interview, Resume, Analytics, etc.)
│   ├── middleware/              # JWT auth and error handling middlewares
│   ├── models/                  # Mongoose Schemas (User, Question, Task, Note, Resume, Interview)
│   ├── routes/                  # Express route definitions
│   ├── utils/                   # Helper functions (Groq AI client, ApiResponse)
│   ├── server.js                # Server entry point & CORS configuration
│   └── package.json
│
└── README.md
```

---

## ⚙️ Environment Variables

### `server/.env`
```env
# Node Environment
NODE_ENV=development
PORT=5000

# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/placement-prep-portal?retryWrites=true&w=majority

# JWT Auth Secret
JWT_SECRET=your_super_secret_jwt_key_in_production
JWT_EXPIRE=7d

# AI API Key (Groq Cloud)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### `client/.env`
```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Mahek-Agarwal-27/placement-prep-portal.git
cd placement-prep-portal
```

### 2. Setup Backend
```bash
cd server
npm install
# Create a .env file based on the environment variables guide above
npm run dev
```
*Backend runs on: `http://localhost:5000`*

### 3. Setup Frontend
```bash
# Open a new terminal
cd client
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

---

## 🌐 Production Deployment

- **Backend (Render)**:
  - Root Directory: `server`
  - Build Command: `npm install`
  - Start Command: `node server.js`
  - Set Environment Variables: `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `CLIENT_URL`

- **Frontend (Vercel)**:
  - Root Directory: `client`
  - Framework: `Vite`
  - Set Environment Variable: `VITE_API_URL=https://<your-render-backend-url>/api`

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
