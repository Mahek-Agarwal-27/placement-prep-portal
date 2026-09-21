# HireNovaAI — Complete 30-Day Learning Roadmap & Technical Documentation 🚀

> **“Your AI-Powered Placement Companion”**  
> *A Zero-to-Hero Masterclass on Web Fundamentals, React 18, Node.js, Express, MongoDB Atlas, Groq LLaMA 3.3, and Cloud Production Deployment.*

---

## 📑 Table of Contents
1. [Technology Cheat Sheet](#1-technology-cheat-sheet)
2. [Complete System Architecture & Data Flow](#2-complete-system-architecture--data-flow)
3. [Frontend Folder Structure (client/)](#3-frontend-folder-structure-client)
4. [Backend Folder Structure (server/)](#4-backend-folder-structure-server)
5. [Database Design & Mongoose Schemas](#5-database-design--mongoose-schemas)
6. [Production REST API Documentation](#6-production-rest-api-documentation)
7. [30-Day Step-by-Step Learning Curriculum](#7-30-day-step-by-step-learning-curriculum)
   - [Phase 1: Programming & Web Foundations (Days 1–5)](#phase-1-programming--web-foundations-days-15)
   - [Phase 2: React Frontend Mastery (Days 6–12)](#phase-2-react-frontend-mastery-days-612)
   - [Phase 3: Node.js & Express Backend (Days 13–18)](#phase-3-nodejs--express-backend-days-1318)
   - [Phase 4: MongoDB & Database Architecture (Days 19–22)](#phase-4-mongodb--database-architecture-days-1922)
   - [Phase 5: Groq AI & Intelligent Features (Days 23–25)](#phase-5-groq-ai--intelligent-features-days-2325)
   - [Phase 6: Full-Stack Integration (Days 26–27)](#phase-6-full-stack-integration-days-2627)
   - [Phase 7: Cloud Deployment & CI/CD (Day 28)](#phase-7-cloud-deployment--cicd-day-28)
   - [Phase 8: Systematic Debugging & Interview Mastery (Days 29–30)](#phase-8-systematic-debugging--interview-mastery-days-2930)
8. [Common Errors & Troubleshooting Guide](#8-common-errors--troubleshooting-guide)
9. [Interview Presentation Scripts (30s, 1m, 2m Deep Dive)](#9-interview-presentation-scripts)
10. [Final 17-Question Self-Assessment Test](#10-final-17-question-self-assessment-test)

---

## 1. Technology Cheat Sheet

| Technology | What it is | Why HireNovaAI uses it | Core Concepts to Know |
|---|---|---|---|
| **React 18** | Component-based UI library | Powers single-page reactive dashboard, tab navigation, and dynamic state updates | Components, Props, State, JSX, Virtual DOM, Reconciliation |
| **Vite** | Next-gen frontend tooling | Lightning-fast Hot Module Replacement (HMR) and optimized build bundles | ES Modules, Build scripts, dev server, vite.config.js |
| **JavaScript (ES6+)** | Web programming language | Powers both frontend React logic and backend Node.js server execution | Arrow functions, Promises, async/await, map/filter, Destructuring |
| **Tailwind CSS** | Utility-first CSS framework | Creates custom Canva-inspired purple design system (#EFE9FE, #6C47FF) | Utility classes, Flexbox, Grid, Responsive prefixes (sm, md, lg) |
| **React Router 6** | Declarative client routing | Manages smooth client-side page transitions and Protected Route guards | Routes, Route, useNavigate, Navigate, Protected Route wrappers |
| **Axios** | HTTP API client library | Sends authenticated requests to Express backend with Bearer JWT interceptors | Interceptors, baseURL, HTTP verbs (GET, POST, PUT, DELETE) |
| **Recharts** | Composable chart library | Renders interactive DSA breakdown, study tasks, ATS score history & interview trends | ResponsiveContainer, PieChart, BarChart, LineChart, Tooltip |
| **Node.js** | Chrome V8 JavaScript runtime | Executes asynchronous server-side code outside the browser | Event loop, Non-blocking I/O, npm packages, process.env |
| **Express.js** | Minimalist web framework | Structures RESTful routing endpoints, middleware pipelines, and JSON responses | req, res, next, router, middleware, errorHandler |
| **MongoDB Atlas** | Cloud NoSQL database | Flexible JSON-like document storage for users, questions, tasks, notes, scans | Collections, Documents, BSON, IP Access (0.0.0.0/0), Clusters |
| **Mongoose** | MongoDB Object Modeling | Enforces strict schemas, validation rules, relationships, and queries | Schema, Model, findOne, updateMany, timestamps, hooks |
| **JWT + bcryptjs** | Authentication & Security | Secures accounts with salt-hashed passwords and stateless token sessions | jwt.sign, jwt.verify, bcrypt.hash, bcrypt.compare, Bearer header |
| **Multer + pdf-parse** | Multipart upload & PDF parser | Accepts resume file uploads and extracts raw text buffer for AI evaluation | multipart/form-data, memoryStorage, diskStorage, text buffers |
| **Groq (LLaMA 3.3)** | Ultra-low-latency LLM API | Generates real-time conversational mock interviews, resume ATS scoring & notes | llama-3.3-70b-versatile, System prompts, temperature, JSON Mode |
| **Vercel + Render** | Cloud Hosting Platforms | Vercel serves React frontend via global CDN; Render hosts Express API service | CI/CD, Build commands, Environment Variables, CORS origin check |

---

## 2. Complete System Architecture & Data Flow

```text
+-------------------------------------------------------------------------------------------------------------------------+
|                                            HIRENOVAAI CLOUD ARCHITECTURE                                                |
+-------------------------------------------------------------------------------------------------------------------------+
|  [ CLIENT / USER BROWSER ]                                                                                             |
|  React 18 + Vite SPA  (Hosted on Vercel Global Edge CDN)                                                                 |
|  • UI Pages: Landing, Dashboard, DSA Tracker, Study Planner, AI Notes, Mock Interview Room, Resume Scanner, Analytics   |
|  • State & Storage: Auth Context, LocalStorage (JWT token, user object), Axios API Client with Bearer Interceptor       |
+-------------------------------------------------------------------------------------------------------------------------+
                                            |
                                            | HTTPS REST API Calls (JSON / FormData)
                                            v
+-------------------------------------------------------------------------------------------------------------------------+
|  [ BACKEND WEB SERVICE ]                                                                                                |
|  Node.js + Express REST API  (Hosted on Render Cloud Platform)                                                           |
|  • Middlewares: CORS, express.json(10mb), Multer (PDF uploads), authMiddleware (JWT verify), errorHandler               |
|  • Route Controllers:                                                                                                   |
|     - /api/auth       --> User Register, Login, Profile & Password Update                                                  |
|     - /api/questions  --> DSA Problems CRUD, Topic Stats, Clear All                                                         |
|     - /api/tasks      --> Study Tasks CRUD, Priorities, Upcoming Session Stats                                          |
|     - /api/notes      --> Smart Notes CRUD, Folders, Tags, Clear All                                                    |
|     - /api/resumes    --> Upload PDF -> Extract text -> Groq ATS Scoring -> History                                     |
|     - /api/interviews --> Groq Voice/Text Mock Interview Turn-by-Turn Evaluation                                            |
|     - /api/analytics  --> Solved counts, Study hours, Readiness Score, Multi-metric Reset API                            |
+-------------------------------------------------------------------------------------------------------------------------+
                |                                                                     |
                | Mongoose ODM Queries                                                | Ultra-Low Latency Inference
                v                                                                     v
+---------------------------------------------------+               +-----------------------------------------------------+
|  [ DATABASE CLUSTER ]                             |               |  [ AI INFERENCE ENGINE ]                            |
|  MongoDB Atlas (Cloud NoSQL)                      |               |  Groq Cloud (LLaMA 3.3 70B Versatile)               |
|  • Collections: Users, Questions, Tasks, Notes,   |               |  • High-Speed Reasoning & Question Generation       |
|    Resumes, Interviews, StudySessions, Activities |               |  • Resume Skill Extraction & ATS Feedback (JSON)    |
|  • Access: Whitelisted 0.0.0.0/0 Network Rule     |               |  • Real-Time Answer Grading & Recommendations       |
+---------------------------------------------------+               +-----------------------------------------------------+
```

---

## 3. Frontend Folder Structure (`client/`)

- `client/src/App.jsx`: Main routing configuration defining public routes (`/`, `/features`, `/login`, `/register`) and protected routes (`/dashboard`, `/dsa-tracker`, `/study-planner`, `/notes`, `/mock-interview`, `/resume-analyzer`, `/analytics`, `/settings`).
- `client/src/components/`: Reusable widgets:
  - `Navbar.jsx`: Top navigation with user dropdown and mobile sidebar triggers.
  - `Sidebar.jsx`: Main responsive navigation with Canva styling and route highlighting.
  - `Logo.jsx`: HireNovaAI branding component with sparkles badge.
  - `PasswordForm.jsx`: Password update form with validation.
  - `TodaysFocusCard.jsx`: Dynamic daily study recommendations widget.
- `client/src/pages/`:
  - `LandingPage.jsx`: Public landing page with responsive 3D rotating orbit animation.
  - `DashboardPage.jsx`: Central overview with Readiness Score meter and streak counter.
  - `DSATrackerPage.jsx`: DSA problem logging, topic filters, difficulty badges.
  - `StudyPlannerPage.jsx`: Study session scheduler and task prioritizer.
  - `NotesPage.jsx`: AI-assisted markdown notebook with folder taxonomy and clear all.
  - `ResumeAnalyzerPage.jsx`: Drag-and-drop PDF resume uploader with ATS match score.
  - `InterviewPage.jsx`: Voice & text AI mock interview simulator with speech recognition.
  - `AnalyticsPage.jsx`: Multi-metric Recharts visualizations and custom reset modal.
- `client/src/services/`:
  - `api.js`: Central Axios instance with Bearer token injection and 401 redirect handling.
  - `authService.js`, `questionService.js`, `taskService.js`, `noteService.js`, `resumeService.js`, `interviewService.js`, `userService.js`.
- `client/vercel.json`: Single Page Application (SPA) rewrite rules to prevent 404 on page reload.

---

## 4. Backend Folder Structure (`server/`)

- `server/server.js`: Application entrypoint configuring CORS, JSON limit (10mb), MongoDB connection, and mounting all 12 API routes.
- `server/config/db.js`: MongoDB Atlas connection pool manager using Mongoose.
- `server/models/`:
  - `User.js`: User credentials, password hash, role, bio, and study streak timestamps.
  - `Question.js`: DSA question title, difficulty, topic, platform, and solved status.
  - `Task.js`: Study planner tasks with category, priority, and deadlines.
  - `Note.js`: Saved study notes with folder taxonomy and tag arrays.
  - `Resume.js`: Stored resume ATS scores, raw extracted text, and AI recommendations.
  - `Interview.js`: Mock interview conversation transcripts and scoring evaluations.
  - `StudySession.js`: Real-time study duration logging in minutes.
  - `Activity.js`: User event stream for Dashboard activity timeline.
- `server/controllers/`:
  - `authController.js`: User signup, login, JWT token generation, password comparison.
  - `questionController.js`: Question CRUD and MongoDB aggregation stats.
  - `taskController.js`: Study task management and category tracking.
  - `noteController.js`: Notes CRUD, folder filtering, and bulk clearing.
  - `resumeController.js`: PDF text extraction via `pdf-parse` and Groq ATS scoring.
  - `interviewController.js`: Groq AI mock interview turn-by-turn evaluation.
  - `analyticsController.js`: Unified placement readiness score calculation and modular reset.
- `server/middleware/`:
  - `authMiddleware.js`: JWT token verification guard.
  - `errorHandler.js`: Centralized error wrapper.
- `server/utils/groqClient.js`: Groq AI SDK helper configured with `llama-3.3-70b-versatile`.

---

## 5. Database Design & Mongoose Schemas

### 1. User Schema (`server/models/User.js`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // bcrypt hashed
  role: { type: String, default: 'student' },
  avatar: { type: String, default: '' },
  targetRole: { type: String, default: 'Software Development Engineer' },
  bio: { type: String, default: '' },
  streak: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null }
  },
  timestamps: true
}
```

### 2. Question Schema (`server/models/Question.js`)
```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  platform: { type: String, enum: ['LeetCode', 'Codeforces', 'GFG', 'HackerRank', 'Other'], default: 'LeetCode' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topic: { type: String, required: true },
  status: { type: String, enum: ['to-do', 'attempted', 'solved'], default: 'to-do' },
  link: { type: String, default: '' },
  notes: { type: String, default: '' },
  solvedAt: { type: Date, default: null },
  timestamps: true
}
```

### 3. Resume Schema (`server/models/Resume.js`)
```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileUrl: { type: String, default: '' },
  rawText: { type: String, default: '' },
  jobDescription: { type: String, default: '' },
  atsScore: { type: Number, required: true, min: 0, max: 100 },
  feedback: {
    generalAdvice: String,
    keywordAnalysis: [String],
    strengths: [String],
    improvements: [String]
  },
  timestamps: true
}
```

---

## 6. Production REST API Documentation

| Verb & Route | Purpose | Auth Required | Request Payload | Response Data |
|---|---|---|---|---|
| `POST /api/auth/register` | Create user account | No | `{ name, email, password }` | `{ success: true, token, user }` |
| `POST /api/auth/login` | Authenticate user | No | `{ email, password }` | `{ success: true, token, user }` |
| `GET /api/auth/me` | Get current user | Yes (Bearer) | None | `{ success: true, data: user }` |
| `GET /api/questions` | Get user questions | Yes (Bearer) | Query: `?status=&difficulty=` | `{ success: true, data: Question[] }` |
| `POST /api/questions` | Log DSA problem | Yes (Bearer) | `{ title, platform, difficulty, topic }` | `{ success: true, data: Question }` |
| `GET /api/questions/stats` | Aggregate DSA counts | Yes (Bearer) | None | `{ success: true, data: { byDifficulty, totalSolved } }` |
| `GET /api/tasks` | Get study tasks | Yes (Bearer) | Query: `?priority=&status=` | `{ success: true, data: Task[] }` |
| `POST /api/tasks` | Create study task | Yes (Bearer) | `{ title, category, priority, dueDate }` | `{ success: true, data: Task }` |
| `POST /api/resumes/analyze` | Parse PDF & score ATS | Yes (Bearer) | FormData: `file, jobDescription` | `{ success: true, data: Resume }` |
| `GET /api/resumes` | Get resume history | Yes (Bearer) | None | `{ success: true, data: Resume[] }` |
| `POST /api/interviews/start` | Start AI mock session | Yes (Bearer) | `{ topic, difficulty, targetRole }` | `{ success: true, data: Interview }` |
| `POST /api/interviews/:id/message` | Send answer to AI | Yes (Bearer) | `{ message }` | `{ success: true, data: { nextQuestion, feedback } }` |
| `POST /api/interviews/:id/finish` | Conclude interview | Yes (Bearer) | None | `{ success: true, data: { finalScore, feedback } }` |
| `GET /api/analytics/realtime` | Get readiness score | Yes (Bearer) | None | `{ success: true, data: { readinessScore, studyHours, ... } }` |
| `POST /api/analytics/reset` | Selective metric reset | Yes (Bearer) | `{ resetDsa, resetTasks, resetStreak, ... }` | `{ success: true, message: "Reset successful" }` |

---

## 7. 30-Day Step-by-Step Learning Curriculum

### Phase 1: Programming & Web Foundations (Days 1–5)
- **Day 1**: Client-Server Architecture, HTTP protocols, JSON formats, Browser DevTools.
- **Day 2**: JS Fundamentals (let/const, Data Types, Objects, Arrays, Template Literals).
- **Day 3**: JS Control Flow, Ternary operators, Arrow functions, Return values.
- **Day 4**: Advanced Array Methods (`.map()`, `.filter()`, Destructuring, Promises, `async/await`).
- **Day 5**: DOM manipulation concepts, ES Modules (`import/export`), npm packages, Git version control.

### Phase 2: React Frontend Mastery (Days 6–12)
- **Day 6**: React Component Architecture, Single Page Applications, Vite bundler, JSX syntax.
- **Day 7**: Props data flow, Component state with `useState`, Event handling (`onClick`, `onChange`).
- **Day 8**: Component Lifecycle & Side Effects with `useEffect`, Dependency arrays, Loading spinners.
- **Day 9**: Controlled Form Inputs, Client-side validation, Login & Signup form state.
- **Day 10**: Client-Side Routing with React Router DOM v6, Dynamic routes, `ProtectedRoute` wrapper.
- **Day 11**: Tailwind CSS design tokens, Responsive breakpoints (`sm`, `md`, `lg`), Flexbox & Grid.
- **Day 12**: Data Visualization with Recharts (`PieChart`, `BarChart`, `LineChart`, `ResponsiveContainer`).

### Phase 3: Node.js & Express Backend (Days 13–18)
- **Day 13**: Node.js runtime, V8 Engine, Non-blocking Event Loop, `process.env` configuration.
- **Day 14**: Express.js server creation, REST API conventions, HTTP methods, `req.body`, `res.json()`.
- **Day 15**: MVC Architecture, Separation of concerns, Express Router, Controller handlers.
- **Day 16**: Middleware pipelines (`next()`), CORS security policy, Centralized Error Handling.
- **Day 17**: User Authentication, Password hashing with `bcryptjs`, Stateless sessions with `JWT`.
- **Day 18**: Multipart file uploads with `Multer`, Buffer streaming, PDF text extraction with `pdf-parse`.

### Phase 4: MongoDB & Database Architecture (Days 19–22)
- **Day 19**: NoSQL Document Databases, BSON structure, MongoDB Collections vs SQL Tables.
- **Day 20**: Mongoose ODM, Schema types, Validation constraints, Enums, Automatic timestamps.
- **Day 21**: Mongoose CRUD Queries (`create()`, `find()`, `findByIdAndUpdate()`, `deleteMany()`, sorting).
- **Day 22**: MongoDB Atlas Cloud Clusters, Connection Strings (`MONGO_URI`), IP Access (`0.0.0.0/0`).

### Phase 5: Groq AI & Intelligent Features (Days 23–25)
- **Day 23**: LLMs, Groq LPU hardware, Prompt Engineering (System vs User), Structured JSON mode.
- **Day 24**: AI Feature Deep Dive: Voice Mock Interviews (Web Speech STT/TTS), ATS Resume Scoring.
- **Day 25**: AI Reliability, Rate limiting (HTTP 429), Regex JSON sanitizers, Fallback error handling.

### Phase 6: Full-Stack Integration (Days 26–27)
- **Day 26**: End-to-End System Integration: Tracing data from React UI to MongoDB and Groq AI.
- **Day 27**: Placement Readiness Score Algorithm (100% weighted formula) & Modular Reset architecture.

### Phase 7: Cloud Deployment & CI/CD (Day 28)
- **Day 28**: Production Hosting: Vercel (Edge Frontend), Render (Express Service), GitHub CI/CD automation.

### Phase 8: Systematic Debugging & Interview Mastery (Days 29–30)
- **Day 29**: 11-Step Debugging Methodology: Network tab inspection, Server logs, CORS & Auth debugging.
- **Day 30**: Interview Presentation Mastery: 30s elevator pitch, 2m technical deep-dive, STAR answers.

---

## 8. Common Errors & Troubleshooting Guide

- **CORS Error**: Origin blocked by server. *Fix:* Add frontend Vercel URL to `allowedOrigins` in `server.js`.
- **401 Unauthorized**: Missing/invalid JWT token. *Fix:* Check localStorage for token, verify `authMiddleware.js`.
- **404 on Vercel Reload**: Missing SPA rewrite. *Fix:* Add `client/vercel.json` with `{"source": "/(.*)", "destination": "/index.html"}`.
- **MongoDB Connection Error**: IP not whitelisted. *Fix:* Add `0.0.0.0/0` in MongoDB Atlas Network Access.
- **Groq JSON Parse SyntaxError**: Markdown backticks in AI response. *Fix:* Sanitize with `.replace(/```json/g, '')`.
- **Render Cold Start (50s delay)**: Free instance spin-down. *Fix:* Display a loading state on frontend.

---

## 9. Interview Presentation Scripts

### 30-Second Elevator Pitch
> “HireNovaAI is an AI-powered placement preparation platform built on the MERN stack and Groq LLaMA 3.3. It helps students prepare for campus technical recruitments through real-time voice AI mock interviews, instant ATS resume scoring, algorithmic DSA progress tracking, and personalized habit planners. The platform is fully live with React on Vercel and Express on Render.”

### 2-Minute Technical Deep-Dive
> “I built HireNovaAI to address the fragmented nature of campus placement preparation. On the frontend, I engineered a Single Page Application using React 18, Vite, and Tailwind CSS, utilizing Recharts for multi-metric progress visualizations. The backend is a RESTful API powered by Node.js and Express, connected to a MongoDB Atlas cloud database through Mongoose models. For the Mock Interview room, I integrated Groq's low-latency LLaMA-3.3-70B model combined with the browser's Web Speech API for seamless Speech-to-Text and Text-to-Speech interaction. For the Resume Analyzer, Multer intercepts PDF uploads, pdf-parse extracts the raw text buffer, and Groq evaluates keyword match rates against target job descriptions, outputting structured ATS feedback. User authentication is secured using bcrypt password hashing and stateless JWT tokens passed via Axios request interceptors. The application is deployed with automated CI/CD pipelines on Vercel and Render.”

---

## 10. Final 17-Question Self-Assessment Test

1. **What is HireNovaAI and why did you build it?**  
   *Answer:* An all-in-one AI career companion solving fragmented placement preparation tools (DSA practice + Resume ATS + Voice Mock Interviews + Habit Planner).
2. **What happens under the hood when a user logs in?**  
   *Answer:* React dispatches credentials via Axios -> Express `authController` queries User -> `bcrypt.compare()` verifies password hash -> `jwt.sign()` generates token -> Token saved in client localStorage.
3. **How does React communicate with Express securely?**  
   *Answer:* Axios interceptor attaches `Authorization: Bearer <token>` to headers; Express `authMiddleware` verifies signature with `JWT_SECRET`.
4. **How does the Resume Analyzer calculate ATS scores?**  
   *Answer:* Multer handles multipart PDF upload -> `pdf-parse` extracts raw text -> Groq evaluates keyword density and format against JD -> Returns structured JSON.
5. **Why did you choose Groq AI over traditional APIs?**  
   *Answer:* Groq's Language Processing Units (LPUs) provide ultra-low sub-second latency required for natural conversational speech in live mock interviews.
6. **How does the AI Mock Interview handle voice interactions?**  
   *Answer:* Browser Web Speech API (`window.SpeechRecognition`) transcribes voice to text -> Backend grades answer -> Browser `speechSynthesis` speaks response.
7. **How are passwords secured in the database?**  
   *Answer:* Passwords are never stored in plaintext. `bcryptjs` salts and hashes passwords using 10 cryptographic rounds.
8. **How is the Placement Readiness Score calculated?**  
   *Answer:* Weighted 100% formula: 40% DSA solved count + 20% Peak Resume ATS + 20% Mock Interview average + 10% study hours + 10% daily streak.
9. **How does the modular Analytics Reset work?**  
   *Answer:* `POST /api/analytics/reset` accepts boolean flags and executes targeted Mongoose `updateMany()` or `deleteMany()` operations across collections.
10. **How does your app handle routing on Vercel without 404s?**  
    *Answer:* `client/vercel.json` rewrites all incoming paths `/(.*)` to `index.html` so React Router can resolve routes client-side.
11. **What was your hardest technical bug and how did you solve it?**  
    *Answer:* Handled intermittent AI JSON parsing syntax errors by implementing robust regex sanitization and fallback object defaults.
12. **How would you scale HireNovaAI to 100,000 active students?**  
    *Answer:* Implement Redis caching for stats, configure database connection pooling/indexes, store PDF resumes on AWS S3, containerize backend with Docker.

---
*Created for HireNovaAI Placement Preparation & Full-Stack Mastery.*
