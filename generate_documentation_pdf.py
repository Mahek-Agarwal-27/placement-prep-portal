import os
import sys
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

def safe_p(text, style):
    """
    Safely sanitizes text for ReportLab by escaping accidental HTML-like tags,
    while preserving allowed markup: <b>, </b>, <i>, </i>, <br/>, <pre>, </pre>.
    """
    # Replace common angle brackets that are NOT allowed tags
    # First protect allowed tags
    placeholders = {
        '<b>': '___B_OPEN___',
        '</b>': '___B_CLOSE___',
        '<i>': '___I_OPEN___',
        '</i>': '___I_CLOSE___',
        '<br/>': '___BR_TAG___',
        '<br>': '___BR_TAG___',
        '<pre>': '___PRE_OPEN___',
        '</pre>': '___PRE_CLOSE___',
    }
    for tag, token in placeholders.items():
        text = text.replace(tag, token)
    
    # Escape all remaining < and >
    text = text.replace('&', '&amp;')
    # unescape our amp if needed or do safe replace
    text = text.replace('<', '&lt;').replace('>', '&gt;')
    
    # Restore allowed tags
    text = text.replace('___B_OPEN___', '<b>').replace('___B_CLOSE___', '</b>')
    text = text.replace('___I_OPEN___', '<i>').replace('___I_CLOSE___', '</i>')
    text = text.replace('___BR_TAG___', '<br/>')
    text = text.replace('___PRE_OPEN___', '<pre>').replace('___PRE_CLOSE___', '</pre>')
    
    return Paragraph(text, style)

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress headers/footers on cover page
        
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#718096"))
        
        # Header
        self.drawString(36, 760, "HireNovaAI — 30-Day Developer Learning Roadmap & Technical Documentation")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(36, 752, 576, 752)
        
        # Footer
        self.line(36, 42, 576, 42)
        self.drawString(36, 30, "Confidential — For Placement Preparation & Technical Interview Mastery")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 30, page_str)
        self.restoreState()

def build_pdf(filename="HireNovaAI_30Day_Roadmap_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=46
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Brand Palette
    C_PRIMARY = colors.HexColor("#6C47FF")   # HireNova Royal Violet
    C_SECONDARY = colors.HexColor("#1A1A2E") # Deep Navy/Slate
    C_ACCENT = colors.HexColor("#10B981")    # Emerald Green
    C_TEXT = colors.HexColor("#2D3748")      # Dark Slate Body
    C_BG_CARD = colors.HexColor("#F8FAFC")   # Light background
    C_BORDER = colors.HexColor("#E2E8F0")    # Border line
    C_CODE_BG = colors.HexColor("#1E1E2E")   # Code block dark bg
    
    # Typography Styles
    style_cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=C_PRIMARY,
        alignment=1
    )
    
    style_cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=17,
        textColor=C_SECONDARY,
        alignment=1
    )
    
    style_cover_tagline = ParagraphStyle(
        'CoverTagline',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=C_ACCENT,
        alignment=1
    )

    style_h1 = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=C_PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    style_h2 = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=C_SECONDARY,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=C_TEXT,
        spaceAfter=2
    )

    style_body_bold = ParagraphStyle(
        'BodyBoldCustom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=C_TEXT,
        spaceAfter=2
    )

    style_callout = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=C_SECONDARY
    )

    style_code = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor("#E2E8F0")
    )
    
    style_table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=C_TEXT
    )

    style_table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    story = []

    # ══════════════════════════════════════════════════════════════════════════
    # COVER PAGE
    # ══════════════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 30))
    story.append(safe_p("HIRENOVA AI", style_cover_title))
    story.append(Spacer(1, 6))
    story.append(safe_p("“Your AI-Powered Placement Companion”", style_cover_tagline))
    story.append(Spacer(1, 12))
    story.append(safe_p("<b>30-DAY ZERO-TO-HERO DEVELOPER LEARNING ROADMAP</b><br/>Complete Codebase Architecture, Technical Documentation &amp; Interview Mastery Guide", style_cover_subtitle))
    story.append(Spacer(1, 16))
    story.append(HRFlowable(width="100%", thickness=3, color=C_PRIMARY, spaceAfter=16, spaceBefore=0))
    
    cover_meta = [
        [safe_p("<b>Target Audience:</b>", style_table_header), safe_p("Beginner / Student aiming for Full-Stack &amp; AI Project Mastery", style_table_header)],
        [safe_p("<b>Project Scope:</b>", style_table_header), safe_p("HireNovaAI (React 18 + Vite + Node/Express + MongoDB + Groq LLaMA 3.3 + Vercel/Render)", style_table_header)],
        [safe_p("<b>Learning Objective:</b>", style_table_header), safe_p("Understand 100% of the codebase, debug issues, modify features, and ace technical interviews", style_table_header)],
        [safe_p("<b>Author / Engineer:</b>", style_table_header), safe_p("HireNovaAI Engineering &amp; Placement Preparation Team", style_table_header)],
        [safe_p("<b>Live Website:</b>", style_table_header), safe_p("https://placement-prep-portal-alpha.vercel.app", style_table_header)],
        [safe_p("<b>Backend API:</b>", style_table_header), safe_p("https://placement-prep-portal-v3w5.onrender.com", style_table_header)]
    ]
    t_meta = Table(cover_meta, colWidths=[140, 400])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_SECONDARY),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.white),
        ('PADDING', (0,0), (-1,-1), 5.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEBELOW', (0,0), (-1,-2), 0.5, colors.HexColor("#32325D")),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 18))

    exec_summary = [
        [safe_p("<b>HOW TO USE THIS ROADMAP (ROADMAP PHILOSOPHY)</b><br/>"
                "You do not need to memorize syntax. The goal over these 30 days is <b>system-level conceptual clarity</b>. "
                "By following this daily curriculum (2 to 4 hours/day), you will progress systematically through Web Basics &rarr; JavaScript &rarr; "
                "React Frontend &rarr; Node.js/Express Backend &rarr; MongoDB Database &rarr; Groq AI &rarr; Integration &rarr; Deployment &rarr; Interview Presentation. "
                "Every single day directly maps concepts to exact files inside your <b>HireNovaAI</b> project.", style_callout)]
    ]
    t_exec = Table(exec_summary, colWidths=[540])
    t_exec.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFE9FE")),
        ('BORDER', (0,0), (-1,-1), 1, C_PRIMARY),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_exec)
    
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 1: TECHNOLOGY CHEAT SHEET
    # ══════════════════════════════════════════════════════════════════════════
    story.append(safe_p("1. Technology Cheat Sheet", style_h1))
    story.append(safe_p("A quick-reference summary of every core technology powering HireNovaAI, why it was chosen, and key concepts.", style_body))
    story.append(Spacer(1, 4))

    tech_data = [
        [safe_p("Technology", style_table_header), safe_p("What it is", style_table_header), safe_p("Why HireNovaAI uses it", style_table_header), safe_p("Core Concepts to Know", style_table_header)],
        [safe_p("<b>React 18</b>", style_table_cell), safe_p("Component-based UI library", style_table_cell), safe_p("Powers dynamic single-page dashboard, tabs, and reactive forms without page reloads", style_table_cell), safe_p("Components, Props, State, JSX, Virtual DOM, Reconciliation", style_table_cell)],
        [safe_p("<b>Vite</b>", style_table_cell), safe_p("Modern frontend build tool &amp; bundler", style_table_cell), safe_p("Instant Hot Module Replacement (HMR) and ultra-fast production builds", style_table_cell), safe_p("ES Modules, Build scripts, dev server, vite.config.js", style_table_cell)],
        [safe_p("<b>JavaScript (ES6+)</b>", style_table_cell), safe_p("Core web programming language", style_table_cell), safe_p("Executes logic on frontend (React) and backend (Node.js)", style_table_cell), safe_p("Arrow functions, Promises, async/await, map/filter, Destructuring", style_table_cell)],
        [safe_p("<b>Tailwind CSS</b>", style_table_cell), safe_p("Utility-first CSS framework", style_table_cell), safe_p("Crafts Canva-inspired purple (#EFE9FE, #6C47FF) responsive UI with zero CSS clutter", style_table_cell), safe_p("Utility classes, Flexbox, Grid, Responsive prefixes (sm, md, lg)", style_table_cell)],
        [safe_p("<b>React Router 6</b>", style_table_cell), safe_p("Declarative client-side routing", style_table_cell), safe_p("Handles smooth navigation between Landing, Dashboard, DSA, Notes, and Interview pages", style_table_cell), safe_p("Routes, Route, useNavigate, Navigate, Protected Route wrapper", style_table_cell)],
        [safe_p("<b>Axios</b>", style_table_cell), safe_p("Promise-based HTTP client", style_table_cell), safe_p("Sends authenticated API calls to Express backend with JWT token interceptors", style_table_cell), safe_p("Interceptors, baseURL, HTTP verbs (GET, POST, PUT, DELETE)", style_table_cell)],
        [safe_p("<b>Recharts</b>", style_table_cell), safe_p("Composable charting library", style_table_cell), safe_p("Renders interactive DSA breakdown, ATS score history &amp; interview progress analytics", style_table_cell), safe_p("ResponsiveContainer, PieChart, BarChart, LineChart, Tooltip", style_table_cell)],
        [safe_p("<b>Node.js</b>", style_table_cell), safe_p("V8 JavaScript runtime engine", style_table_cell), safe_p("Executes backend JavaScript asynchronously outside the browser", style_table_cell), safe_p("Event loop, Non-blocking I/O, npm packages, process.env", style_table_cell)],
        [safe_p("<b>Express.js</b>", style_table_cell), safe_p("Fast, minimalist web framework", style_table_cell), safe_p("Structures REST API endpoints, routing, middleware pipeline, and JSON responses", style_table_cell), safe_p("req, res, next, router, middleware, errorHandler", style_table_cell)],
        [safe_p("<b>MongoDB Atlas</b>", style_table_cell), safe_p("Cloud NoSQL Document Database", style_table_cell), safe_p("Flexible JSON-like storage for user accounts, questions, tasks, notes &amp; scans", style_table_cell), safe_p("Collections, Documents, BSON, IP Access (0.0.0.0/0), Clusters", style_table_cell)],
        [safe_p("<b>Mongoose</b>", style_table_cell), safe_p("MongoDB Object Data Modeling (ODM)", style_table_cell), safe_p("Provides strict data validation, schemas, relationships, and queries in Express", style_table_cell), safe_p("Schema, Model, findOne, updateMany, timestamps, hooks", style_table_cell)],
        [safe_p("<b>JWT + bcryptjs</b>", style_table_cell), safe_p("Security &amp; Auth standards", style_table_cell), safe_p("Secures user accounts with salt-hashed passwords and stateless token sessions", style_table_cell), safe_p("jwt.sign, jwt.verify, bcrypt.hash, bcrypt.compare, Bearer header", style_table_cell)],
        [safe_p("<b>Multer + pdf-parse</b>", style_table_cell), safe_p("Multipart upload &amp; PDF parser", style_table_cell), safe_p("Accepts PDF resume uploads on backend and extracts raw text for AI ATS scoring", style_table_cell), safe_p("multipart/form-data, memoryStorage, diskStorage, text buffer", style_table_cell)],
        [safe_p("<b>Groq SDK (LLaMA 3.3)</b>", style_table_cell), safe_p("Ultra-low-latency LLM API", style_table_cell), safe_p("Generates real-time conversational mock interviews, resume ATS reviews &amp; notes summaries", style_table_cell), safe_p("llama-3.3-70b-versatile, System prompt, temperature, JSON format", style_table_cell)],
        [safe_p("<b>Vercel + Render</b>", style_table_cell), safe_p("Production Cloud Hosting", style_table_cell), safe_p("Vercel hosts React frontend globally (CDN); Render hosts Node.js Express server", style_table_cell), safe_p("CI/CD, Build commands, Environment Variables, CORS origin matching", style_table_cell)]
    ]
    t_tech = Table(tech_data, colWidths=[80, 110, 180, 170])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_CARD]),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 10))

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 2: COMPLETE ARCHITECTURE & DATA FLOW DIAGRAMS
    # ══════════════════════════════════════════════════════════════════════════
    story.append(safe_p("2. Complete Architecture & System Data Flows", style_h1))
    story.append(safe_p("HireNovaAI operates on a decoupled client-server architecture with an asynchronous AI intelligence layer.", style_body))
    story.append(Spacer(1, 4))

    arch_diagram = """+-------------------------------------------------------------------------------------------------------------------------+
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
+---------------------------------------------------+               +-----------------------------------------------------+"""
    
    t_arch = Table([[safe_p(f"<pre>{arch_diagram.strip()}</pre>", style_code)]], colWidths=[540])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_CODE_BG),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BORDER', (0,0), (-1,-1), 1, C_PRIMARY)
    ]))
    story.append(t_arch)
    
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 3: FRONTEND FOLDER STRUCTURE
    # ══════════════════════════════════════════════════════════════════════════
    story.append(safe_p("3. Frontend Folder Structure (client/)", style_h1))
    story.append(safe_p("The frontend is built with React 18 and Vite. Below is the exact file-by-file mapping of the client application:", style_body))
    story.append(Spacer(1, 4))

    fe_files = [
        [safe_p("Directory / File", style_table_header), safe_p("Role in HireNovaAI", style_table_header), safe_p("Key Features & Code Logic", style_table_header)],
        [safe_p("<b>client/src/App.jsx</b>", style_table_cell), safe_p("Root Application Router", style_table_cell), safe_p("Defines all BrowserRouter routes, ProtectedRoute guards, and 404 fallback routing", style_table_cell)],
        [safe_p("<b>client/src/index.css</b>", style_table_cell), safe_p("Global Design System", style_table_cell), safe_p("Tailwind directives, custom scrollbars, animations, and purple palette variables", style_table_cell)],
        [safe_p("<b>client/src/components/</b><br/>Navbar.jsx, Sidebar.jsx, Logo.jsx", style_table_cell), safe_p("Core Layout Navigation", style_table_cell), safe_p("Sidebar with active route highlighting, mobile sliding drawer, responsive desktop collapse", style_table_cell)],
        [safe_p("<b>client/src/components/</b><br/>PasswordForm.jsx, TodaysFocusCard.jsx", style_table_cell), safe_p("Modular Widget Components", style_table_cell), safe_p("Profile security settings form, dynamic daily task recommendations card", style_table_cell)],
        [safe_p("<b>client/src/pages/</b><br/>LandingPage.jsx, FeaturesPage.jsx", style_table_cell), safe_p("Public Visitor Experience", style_table_cell), safe_p("Hero with 3D rotating orbit animation, feature cards, FAQ accordion, auth links", style_table_cell)],
        [safe_p("<b>client/src/pages/</b><br/>DashboardPage.jsx", style_table_cell), safe_p("Command Center", style_table_cell), safe_p("Readiness score meter, study streak counters, quick action launchers, weekly graph", style_table_cell)],
        [safe_p("<b>client/src/pages/</b><br/>DSATrackerPage.jsx", style_table_cell), safe_p("Problem Practice Tracker", style_table_cell), safe_p("Filter by platform/difficulty/topic, log question status, search problems", style_table_cell)],
        [safe_p("<b>client/src/pages/</b><br/>StudyPlannerPage.jsx", style_table_cell), safe_p("Daily Schedule &amp; Tasks", style_table_cell), safe_p("Task priorities, deadlines, study duration session logger, progress metrics", style_table_cell)],
        [safe_p("<b>client/src/pages/</b><br/>NotesPage.jsx", style_table_cell), safe_p("Smart AI Study Notes", style_table_cell), safe_p("Folder categories, tags, single delete &amp; Clear All, Groq AI concept summarizer", style_table_cell)],
        [safe_p("<b>client/src/pages/</b><br/>ResumeAnalyzerPage.jsx", style_table_cell), safe_p("ATS Resume Intelligence", style_table_cell), safe_p("Drag-and-drop PDF upload, target JD input, real-time score circular meter, history", style_table_cell)],
        [safe_p("<b>client/src/pages/</b><br/>InterviewPage.jsx", style_table_cell), safe_p("AI Mock Interview Room", style_table_cell), safe_p("Interactive voice STT/TTS interview simulation, turn-by-turn answer evaluation", style_table_cell)],
        [safe_p("<b>client/src/pages/</b><br/>AnalyticsPage.jsx", style_table_cell), safe_p("Progress Analytics", style_table_cell), safe_p("Recharts multi-metric charts, custom selective reset progress modal with confirm dialog", style_table_cell)],
        [safe_p("<b>client/src/services/api.js</b>", style_table_cell), safe_p("Axios Base Client", style_table_cell), safe_p("Configures VITE_API_URL, Bearer token injection, and 401 unauthenticated redirect", style_table_cell)],
        [safe_p("<b>client/src/services/</b><br/>*Service.js", style_table_cell), safe_p("Modular API Connectors", style_table_cell), safe_p("authService, questionService, taskService, noteService, resumeService, interviewService", style_table_cell)],
        [safe_p("<b>client/vercel.json</b>", style_table_cell), safe_p("Vercel SPA Rewrites", style_table_cell), safe_p("Directs all frontend sub-routes (/(.*)) to index.html to prevent 404 on reload", style_table_cell)]
    ]
    t_fe = Table(fe_files, colWidths=[120, 140, 280])
    t_fe.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_CARD]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_fe)
    story.append(Spacer(1, 10))

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 4: BACKEND FOLDER STRUCTURE
    # ══════════════════════════════════════════════════════════════════════════
    story.append(safe_p("4. Backend Folder Structure (server/)", style_h1))
    story.append(safe_p("The backend follows the standard MVC architecture separated into distinct layers:", style_body))
    story.append(Spacer(1, 4))

    be_files = [
        [safe_p("Directory / File", style_table_header), safe_p("Role in HireNovaAI", style_table_header), safe_p("Underlying Implementation Details", style_table_header)],
        [safe_p("<b>server/server.js</b>", style_table_cell), safe_p("Server Entrypoint", style_table_cell), safe_p("Initializes Express, connects MongoDB Atlas, configures CORS, mounts all 12 API routes", style_table_cell)],
        [safe_p("<b>server/config/db.js</b>", style_table_cell), safe_p("Database Connector", style_table_cell), safe_p("Connects to MongoDB Atlas using Mongoose with connection pooling and error exit handling", style_table_cell)],
        [safe_p("<b>server/models/</b><br/>User.js, Question.js, Task.js", style_table_cell), safe_p("Mongoose Data Models", style_table_cell), safe_p("Schema schemas with validation, user references, difficulty/priority enums, timestamps", style_table_cell)],
        [safe_p("<b>server/models/</b><br/>Note.js, Resume.js, Interview.js", style_table_cell), safe_p("AI &amp; Media Models", style_table_cell), safe_p("Stores extracted resume text, ATS feedback, mock interview transcripts &amp; scores", style_table_cell)],
        [safe_p("<b>server/models/</b><br/>StudySession.js, Activity.js", style_table_cell), safe_p("Activity Tracking Models", style_table_cell), safe_p("Stores exact duration in minutes and user event streams for streak calculation", style_table_cell)],
        [safe_p("<b>server/controllers/</b><br/>authController.js, userController.js", style_table_cell), safe_p("Account Controllers", style_table_cell), safe_p("Handles signup, login token generation, password hashing comparison, profile updating", style_table_cell)],
        [safe_p("<b>server/controllers/</b><br/>resumeController.js", style_table_cell), safe_p("Resume Intelligence", style_table_cell), safe_p("Parses uploaded PDF with pdf-parse, prompts Groq AI, structures JSON feedback &amp; score", style_table_cell)],
        [safe_p("<b>server/controllers/</b><br/>interviewController.js", style_table_cell), safe_p("Mock Interview Engine", style_table_cell), safe_p("Conducts multi-turn conversational interview, grades answers against domain criteria", style_table_cell)],
        [safe_p("<b>server/controllers/</b><br/>analyticsController.js", style_table_cell), safe_p("Readiness Analytics &amp; Reset", style_table_cell), safe_p("Calculates weighted readiness score (0-100%) and provides selective reset operations", style_table_cell)],
        [safe_p("<b>server/middleware/</b><br/>authMiddleware.js", style_table_cell), safe_p("JWT Authentication Guard", style_table_cell), safe_p("Extracts Bearer token from headers, verifies with JWT_SECRET, attaches req.user", style_table_cell)],
        [safe_p("<b>server/middleware/</b><br/>errorHandler.js, upload.js", style_table_cell), safe_p("Utility Middlewares", style_table_cell), safe_p("Centralized asyncHandler and Multer file upload validation for PDF mime types", style_table_cell)],
        [safe_p("<b>server/utils/groqClient.js</b>", style_table_cell), safe_p("AI Service Helper", style_table_cell), safe_p("Initializes Groq SDK, configures llama-3.3-70b-versatile, fallback parsing", style_table_cell)]
    ]
    t_be = Table(be_files, colWidths=[120, 140, 280])
    t_be.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_CARD]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_be)
    
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 5: DATABASE DESIGN & SCHEMA MAP
    # ══════════════════════════════════════════════════════════════════════════
    story.append(safe_p("5. Database Design & Mongoose Schema Mapping", style_h1))
    story.append(safe_p("HireNovaAI uses MongoDB Atlas. Below are the actual production Mongoose schemas created in the project:", style_body))
    story.append(Spacer(1, 4))

    db_schemas = [
        [safe_p("Model Name", style_table_header), safe_p("Key Schema Fields", style_table_header), safe_p("Relationships &amp; Enums", style_table_header)],
        [safe_p("<b>User</b><br/>(models/User.js)", style_table_cell), safe_p("name, email (unique), password (hashed), role, avatar, targetRole, bio, streak: { currentStreak, longestStreak, lastActiveDate }, timestamps", style_table_cell), safe_p("Primary authentication record. Referenced by all user-specific data models via user: ObjectId", style_table_cell)],
        [safe_p("<b>Question</b><br/>(models/Question.js)", style_table_cell), safe_p("user (ref: User), title, platform, difficulty, topic, status, link, notes, solvedAt, timestamps", style_table_cell), safe_p("platform: ['LeetCode', 'Codeforces', 'GFG', ...]<br/>difficulty: ['Easy', 'Medium', 'Hard']<br/>status: ['to-do', 'solved', 'attempted']", style_table_cell)],
        [safe_p("<b>Task</b><br/>(models/Task.js)", style_table_cell), safe_p("user (ref: User), title, description, category, priority, status, dueDate, estimatedHours, completedAt, timestamps", style_table_cell), safe_p("category: ['DSA', 'Development', 'System Design', 'Core Subjects', 'Aptitude', ...]<br/>priority: ['low', 'medium', 'high']<br/>status: ['pending', 'in-progress', 'completed']", style_table_cell)],
        [safe_p("<b>Note</b><br/>(models/Note.js)", style_table_cell), safe_p("user (ref: User), title, content, folder, tags (array of strings), isFavorite, timestamps", style_table_cell), safe_p("Personal study notebook with folder taxonomy and AI summary notes storage", style_table_cell)],
        [safe_p("<b>Resume</b><br/>(models/Resume.js)", style_table_cell), safe_p("user (ref: User), fileName, originalName, fileUrl, rawText, jobDescription, atsScore (Number), feedback: { generalAdvice, keywordAnalysis, strengths, improvements }, timestamps", style_table_cell), safe_p("Stores ATS evaluation scores (0-100) and detailed AI structural improvements", style_table_cell)],
        [safe_p("<b>Interview</b><br/>(models/Interview.js)", style_table_cell), safe_p("user (ref: User), topic, difficulty, targetRole, messages: [{ role, content, timestamp }], feedback: { score, strengths, improvements, detailedFeedback }, status, score, timestamps", style_table_cell), safe_p("topic: ['Full Stack', 'DSA', 'System Design', 'HR', ...]<br/>status: ['in-progress', 'completed', 'cancelled']", style_table_cell)],
        [safe_p("<b>StudySession</b><br/>(models/StudySession.js)", style_table_cell), safe_p("user (ref: User), activityType, durationMinutes, date, timestamps", style_table_cell), safe_p("activityType: ['dsa', 'ai', 'interview', 'notes', 'manual']. Powers real-time study hours calculation", style_table_cell)],
        [safe_p("<b>Activity</b><br/>(models/Activity.js)", style_table_cell), safe_p("user (ref: User), type, title, description, timestamps", style_table_cell), safe_p("type: ['login', 'resume', 'dsa', 'ai', 'interview', 'profile']. Streams event timeline to Dashboard", style_table_cell)]
    ]
    t_db = Table(db_schemas, colWidths=[90, 250, 200])
    t_db.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_CARD]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_db)
    story.append(Spacer(1, 10))

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 6: API DOCUMENTATION TABLE
    # ══════════════════════════════════════════════════════════════════════════
    story.append(safe_p("6. Production API Endpoints Documentation", style_h1))
    story.append(safe_p("All backend routes mounted on the Express server (Base URL: /api):", style_body))
    story.append(Spacer(1, 4))

    api_endpoints = [
        [safe_p("Verb &amp; Route", style_table_header), safe_p("Purpose / Action", style_table_header), safe_p("Auth Req?", style_table_header), safe_p("DB / AI Interaction", style_table_header)],
        [safe_p("<b>POST /api/auth/register</b>", style_table_cell), safe_p("Register new student account", style_table_cell), safe_p("No", style_table_cell), safe_p("Hashes password via bcrypt -> Saves User -> Generates JWT", style_table_cell)],
        [safe_p("<b>POST /api/auth/login</b>", style_table_cell), safe_p("Login with email &amp; password", style_table_cell), safe_p("No", style_table_cell), safe_p("Verifies password hash -> Returns user info + JWT token", style_table_cell)],
        [safe_p("<b>GET /api/auth/me</b>", style_table_cell), safe_p("Fetch current authenticated user", style_table_cell), safe_p("Yes (Bearer)", style_table_cell), safe_p("Finds User by req.user.id (excluding password)", style_table_cell)],
        [safe_p("<b>GET /api/questions</b>", style_table_cell), safe_p("List user DSA questions (with filters)", style_table_cell), safe_p("Yes (Bearer)", style_table_cell), safe_p("Queries Question collection by topic, difficulty, search", style_table_cell)],
        [safe_p("<b>GET /api/questions/stats</b>", style_table_cell), safe_p("Aggregate DSA solved statistics", style_table_cell), safe_p("Yes (Bearer)", style_table_cell), safe_p("MongoDB aggregation pipeline ($group by difficulty &amp; topic)", style_table_cell)],
        [safe_p("<b>POST /api/questions</b>", style_table_cell), safe_p("Log a new DSA problem", style_table_cell), safe_p("Yes (Bearer)", style_table_cell), safe_p("Creates Question document + logs Activity record", style_table_cell)],
        [safe_p("<b>GET /api/tasks</b>", style_table_cell), safe_p("Fetch study planner tasks", style_table_cell), safe_p("Yes (Bearer)", style_table_cell), safe_p("Queries Task collection with priority &amp; status filtering", style_table_cell)],
        [safe_p("<b>GET /api/tasks/stats</b>", style_table_cell), safe_p("Fetch study task completion stats", style_table_cell), safe_p("Yes (Bearer)", style_table_cell), safe_p("Aggregates total completed vs pending tasks across categories", style_table_cell)],
        [safe_p("<b>POST /api/resumes/analyze</b>", style_table_cell), safe_p("Upload PDF &amp; execute ATS analysis", style_table_cell), safe_p("Yes (Bearer)", style_table_cell), safe_p("Multer parses PDF -> Groq LLaMA 3.3 scores ATS -> Saves Resume", style_table_cell)],
        [safe_p("<b>GET /api/resumes</b>", style_table_cell), safe_p("Fetch past resume scan history", style_table_cell), safe_p("Yes (Bearer)", style_table_cell), safe_p("Queries Resume collection sorted by createdAt desc", style_table_cell)],
        [safe_p("<b>POST /api/interviews/start</b>", style_table_cell), safe_p("Initialize new AI Mock Interview", style_table_cell), safe_p("Yes (Bearer)", style_table_cell), safe_p("Groq generates opening interview question -> Saves Interview", style_table_cell)],
        [safe_p("<b>POST /api/interviews/:id/message</b>", style_table_cell), safe_p("Send answer &amp; receive next question", style_table_cell), safe_p("Yes (Bearer)", style_table_cell), safe_p("Groq evaluates answer quality -> Appends message transcript", style_table_cell)],
        [safe_p("<b>POST /api/interviews/:id/finish</b>", style_table_cell), safe_p("Conclude interview &amp; calculate final score", style_table_cell), safe_p("Yes (Bearer)", style_table_cell), safe_p("Groq generates holistic scoring JSON -> Updates Interview status", style_table_cell)],
        [safe_p("<b>GET /api/analytics/realtime</b>", style_table_cell), safe_p("Fetch unified placement readiness score", style_table_cell), safe_p("Yes (Bearer)", style_table_cell), safe_p("Aggregates DSA, Resume ATS, Interview scores &amp; Study streak", style_table_cell)],
        [safe_p("<b>POST /api/analytics/reset</b>", style_table_cell), safe_p("Selectively reset placement analytics", style_table_cell), safe_p("Yes (Bearer)", style_table_cell), safe_p("Resets Question to-do status, StudySessions, Streaks, Scans", style_table_cell)]
    ]
    t_api = Table(api_endpoints, colWidths=[140, 160, 70, 170])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_CARD]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_api)
    
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 7: 30-DAY DETAILED LEARNING CURRICULUM
    # ══════════════════════════════════════════════════════════════════════════
    story.append(safe_p("7. 30-Day Step-by-Step Learning Curriculum", style_h1))
    story.append(safe_p("A day-by-day learning blueprint taking you from absolute web fundamentals to interview readiness.", style_body))
    story.append(Spacer(1, 4))

    def render_day(day_num, title, goal, topics, why_needed, concepts, code_map, task, exercise, interview_q, checklist, est_hours):
        day_content = []
        day_content.append(safe_p(f"<b>DAY {day_num} &mdash; {title.upper()}</b>", style_h2))
        
        info_table_data = [
            [safe_p("<b>🎯 Daily Goal:</b>", style_body_bold), safe_p(goal, style_body)],
            [safe_p("<b>📚 Topics:</b>", style_body_bold), safe_p(topics, style_body)],
            [safe_p("<b>💡 Why HireNovaAI Needs This:</b>", style_body_bold), safe_p(why_needed, style_body)],
            [safe_p("<b>🧠 Concepts to Master:</b>", style_body_bold), safe_p(concepts, style_body)],
            [safe_p("<b>🔗 Where Used in Project:</b>", style_body_bold), safe_p(code_map, style_body)],
            [safe_p("<b>💻 Practical Task:</b>", style_body_bold), safe_p(task, style_body)],
            [safe_p("<b>📝 Mini Exercise:</b>", style_body_bold), safe_p(exercise, style_body)],
            [safe_p("<b>🎤 Interview Question &amp; Answer:</b>", style_body_bold), safe_p(interview_q, style_body)],
            [safe_p("<b>✅ Daily Checklist:</b>", style_body_bold), safe_p(checklist, style_body)],
            [safe_p("<b>⏱ Estimated Time:</b>", style_body_bold), safe_p(f"<b>{est_hours} Hours</b>", style_body_bold)]
        ]
        t_day = Table(info_table_data, colWidths=[130, 410])
        t_day.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,-1), C_BG_CARD),
            ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('PADDING', (0,0), (-1,-1), 2.8),
        ]))
        day_content.append(t_day)
        day_content.append(Spacer(1, 6))
        return day_content

    # Days 1 to 30 rendered with safe_p
    days_data = [
        (1, "Web Fundamentals & Client-Server Architecture",
         "Understand how the browser interacts with web servers, HTTP request/response lifecycles, and the high-level architecture of HireNovaAI.",
         "Client vs Server, Request-Response cycle, HTTP methods (GET, POST, PUT, DELETE), JSON format, Browser rendering engine, Single Page Application (SPA) concept.",
         "HireNovaAI is split into a Vercel-hosted frontend (client) and a Render-hosted backend (server) that exchange data via JSON over HTTP.",
         "Client sends HTTP requests with payloads; Server processes requests and returns status codes (200 OK, 401 Unauthorized, 500 Server Error) and JSON responses.",
         "client/src/services/api.js (Axios requests), server/server.js (Express HTTP server listening on port 5000).",
         "Open Chrome DevTools (F12) -> Network Tab on your live HireNovaAI site. Click 'Log DSA Problem' and inspect the HTTP request payload and response JSON.",
         "Write down on paper the exact 5 steps that happen when a user clicks 'Login' until the dashboard appears.",
         "<b>Q: What is the difference between a Client and a Server in a modern web app?</b><br/><b>A:</b> The client is the user interface running in the browser (handling UI/UX and user actions), while the server runs on a remote machine handling business logic, database queries, authentication, and secure AI API keys.",
         "[ ] Can explain HTTP GET vs POST<br/>[ ] Understand why JSON is the standard data format<br/>[ ] Know what a status code is", "2.5"),

        (2, "JavaScript Core: Variables, Data Types & Operators",
         "Master JavaScript variable declarations (let, const), primitive types, arrays, and objects with HireNovaAI data structures.",
         "let vs const vs var, Data Types (String, Number, Boolean, Null, Undefined, Object, Array), Template Literals (`Hello ${name}`), Strict Equality (===).",
         "Every single metric in HireNovaAI (user profiles, question difficulty, ATS match scores, study hours) is stored and manipulated using JS variables and objects.",
         "Primitives store raw values; Objects store key-value pairs; Arrays store lists. const prevents reassignment; let allows updating values.",
         "client/src/pages/AnalyticsPage.jsx (dsaTotal, dsaStats state variables), server/models/Question.js (schema types: String, Number).",
         "Create a JS object in browser console representing a HireNovaAI Question: { id: 1, title: 'Two Sum', difficulty: 'Easy', status: 'solved', solvedAt: new Date() }.",
         "Write a condition that checks if a user's resume score is greater than or equal to 75 and returns 'Strong Match', else 'Optimization Needed'.",
         "<b>Q: Why do we prefer const and let over var in modern JavaScript?</b><br/><b>A:</b> var is function-scoped and prone to hoisting bugs, whereas const and let are block-scoped ({}), preventing accidental re-declarations and making state management predictable.",
         "[ ] Can explain const vs let<br/>[ ] Understand object key-value pairs<br/>[ ] Can format strings using template literals", "2.5"),

        (3, "JavaScript Control Flow, Functions & Arrow Functions",
         "Learn decision making (if/else, switch), loops, traditional functions vs modern ES6 arrow functions.",
         "if/else conditions, Ternary operator (condition ? val1 : val2), switch statements, for loops, traditional function vs arrow function (() => {}), return statements.",
         "HireNovaAI uses ternary operators for conditional UI badges (e.g. green for Easy, red for Hard) and arrow functions for all React components and API helpers.",
         "Arrow functions offer concise syntax and lexically bind the 'this' keyword, making them ideal for React event handlers and Express route controllers.",
         "client/src/pages/DSATrackerPage.jsx (difficulty color switch logic), server/controllers/analyticsController.js (arrow functions for controllers).",
         "Write a JavaScript arrow function getDifficultyBadgeColor(difficulty) that returns '#10B981' for Easy, '#F59E0B' for Medium, and '#EF4444' for Hard.",
         "Convert a traditional function function calculateHours(minutes) { return minutes / 60; } into an ES6 arrow function.",
         "<b>Q: What is a ternary operator and where is it commonly used in React?</b><br/><b>A:</b> It is a one-line shorthand for if/else (condition ? trueVal : falseVal). In React JSX, it is used for conditional rendering, such as showing a loading spinner while loading is true.",
         "[ ] Mastered arrow function syntax<br/>[ ] Can write clean ternary expressions<br/>[ ] Understand function return values", "3.0"),

        (4, "Essential Array Methods, Destructuring & Async/Await",
         "Master the 4 most critical JS tools in React and Node: map, filter, destructuring, and Promises (async/await).",
         "Array.prototype.map(), filter(), find(), reduce(), Object &amp; Array Destructuring ({ name } = user), Spread Operator (...), Promises, async/await, try/catch.",
         "HireNovaAI renders all lists (questions, notes, interview messages) using .map(), filters completed tasks with .filter(), and handles API calls with async/await.",
         ".map() transforms every element in an array into a new array (e.g. data to JSX cards). async/await pauses execution until a Promise (like an API fetch) resolves.",
         "client/src/pages/NotesPage.jsx (notes.map(note => <Card />)), server/controllers/questionController.js (async (req, res) => { try { await ... } }).",
         "Take an array of 3 questions [{difficulty: 'Easy'}, {difficulty: 'Hard'}, {difficulty: 'Easy'}], use .filter() to extract only 'Easy' questions, and .map() to return titles.",
         "Write an async function that fetches mock user data with try/catch block and logs errors gracefully.",
         "<b>Q: Why is async/await preferred over traditional callbacks or raw .then() chains?</b><br/><b>A:</b> async/await allows asynchronous code to be read sequentially and cleanly like synchronous code, eliminating 'callback hell' and simplifying error handling via try/catch.",
         "[ ] Can transform lists using .map()<br/>[ ] Can filter datasets using .filter()<br/>[ ] Understand async/await with try/catch", "3.5"),

        (5, "DOM Basics, ES Modules & Package Management (npm/Git)",
         "Understand the Document Object Model (DOM), ES6 import/export modules, package.json dependencies, and Git version control.",
         "Virtual DOM vs Real DOM, import / export default, npm install, package.json vs package-lock.json, dependencies vs devDependencies, Git add/commit/push.",
         "HireNovaAI imports modular components (Navbar, Sidebar) across files and manages libraries (Lucide icons, Recharts, Groq SDK) through npm.",
         "Modules allow breaking huge codebases into small reusable files. package.json acts as the project manifest listing all third-party libraries.",
         "client/package.json, server/package.json, client/src/components/Sidebar.jsx (export default Sidebar).",
         "Run git status and git log in your terminal to see the commit history of HireNovaAI. Inspect how packages like recharts and groq-sdk are listed in package.json.",
         "Explain the difference between npm install package (production dependency) and npm install -D package (developer dependency).",
         "<b>Q: What is the purpose of package-lock.json?</b><br/><b>A:</b> It locks the exact versions of all installed packages and their sub-dependencies, ensuring that the app builds identically on every developer machine, Vercel, and Render.",
         "[ ] Understand ES6 import/export<br/>[ ] Know how npm manages dependencies<br/>[ ] Can execute Git commit and push workflows", "2.5"),

        (6, "React Fundamentals: Vite, JSX & Component Tree",
         "Understand why React is used for HireNovaAI, how Single Page Applications (SPAs) work, and how JSX is compiled into JavaScript.",
         "React Component-Based Architecture, Single Page Application (SPA), Vite build tool, JSX syntax rules, Virtual DOM reconciliation.",
         "Instead of loading separate HTML files for every page, React loads a single index.html and dynamically re-renders UI components instantly.",
         "JSX looks like HTML but is JavaScript syntax extension. Every JSX tag compiles to React.createElement(). Components must return a single root element.",
         "client/src/main.jsx (ReactDOM.createRoot), client/src/pages/LandingPage.jsx (Hero, Features, Orbit components).",
         "Open client/src/components/Logo.jsx. Inspect how the HireNovaAI logo and sparkles icon are encapsulated into a reusable JSX component.",
         "Create a small functional component UserBadge that takes a username string and renders a styled rounded badge.",
         "<b>Q: Why is React called a Single Page Application (SPA)?</b><br/><b>A:</b> Because the browser only loads one HTML page on initial visit. Subsequent navigation and UI updates happen dynamically in JavaScript without full page reloads, providing instant app-like speed.",
         "[ ] Understand JSX compilation<br/>[ ] Know how Vite compiles React files<br/>[ ] Can create a basic functional component", "3.0"),

        (7, "React State & Props: useState & Event Handling",
         "Master the two pillars of React data flow: Props (passing data down) and State (managing component memory with useState).",
         "Props (read-only parameters), State (mutable component memory), useState hook, React unidirectional data flow, Event Handlers (onClick, onChange).",
         "In HireNovaAI, the search query typed in DSA Tracker, the active note selected in AI Notes, and the timer in Mock Interview are all stored in React state.",
         "Props flow from parent to child components. When state changes via its setter function (e.g. setCount), React re-renders the component with the new value.",
         "client/src/pages/NotesPage.jsx (const [notes, setNotes] = useState([]), const [activeNote, setActiveNote] = useState(null)).",
         "Trace how Sidebar.jsx receives the isCollapsed prop and uses it to conditionally render full text labels or collapsed icon buttons.",
         "Write a useState snippet that toggles a boolean isModalOpen between true and false when a button is clicked.",
         "<b>Q: Can a child component modify a prop directly? Why or why not?</b><br/><b>A:</b> No. Props are strictly read-only (immutable). To change parent data, the parent must pass down a state setter function as a callback prop.",
         "[ ] Understand useState syntax and re-renders<br/>[ ] Know how to pass and read Props<br/>[ ] Can write onClick and onChange event handlers", "3.0"),

        (8, "Lifecycle & Side Effects: useEffect Hook & API Loading",
         "Master the useEffect hook for data fetching on component mount, dependency arrays, loading spinners, and error alerts.",
         "useEffect lifecycle concept (Mount, Update, Unmount), Dependency Array ([] vs [prop] vs no array), Loading states, Error handling in UI.",
         "When a student navigates to AnalyticsPage or DSATrackerPage, useEffect fires an asynchronous Axios call to fetch saved records from Express.",
         "useEffect(() => { ... }, []) with an empty dependency array executes once when the component first appears on the screen (mount).",
         "client/src/pages/AnalyticsPage.jsx (useEffect calls fetchAnalytics() on initial render), client/src/pages/InterviewPage.jsx.",
         "Inspect the loading spinner logic in DSATrackerPage.jsx: {loading ? <Loader /> : <Table />}. Notice how loading is set to true before API fetch and false in finally.",
         "Write a useEffect hook that logs 'Component Mounted' once, and another that logs every time a topic state variable changes.",
         "<b>Q: What happens if you omit the dependency array in a useEffect hook?</b><br/><b>A:</b> The effect will run after *every single render* of the component, which can cause infinite loops if the effect updates state.",
         "[ ] Understand useEffect dependency arrays<br/>[ ] Can implement loading & error states<br/>[ ] Know how to fetch data safely on page load", "3.5"),

        (9, "Controlled Forms, Validation & Authentication UI",
         "Build controlled input forms, handle form submission (e.preventDefault), and bind input values to React state for Login and Signup.",
         "Controlled Components, value={state} + onChange={handler}, Form submission (e.preventDefault()), Client-side validation, Password toggles.",
         "HireNovaAI's Login and Register modals, Add Task forms, and Target Job Description textareas are all controlled inputs.",
         "In a controlled input, React state is the 'single source of truth'. Every keystroke updates React state, and React state controls the visible input value.",
         "client/src/components/PasswordForm.jsx (currentPassword, newPassword, confirmPassword controlled inputs), client/src/pages/LandingPage.jsx.",
         "Inspect PasswordForm.jsx: see how handleSubmit validates that newPassword === confirmPassword before calling the backend userService.",
         "Create a small form with title and category dropdown inputs that logs the submitted object on submit.",
         "<b>Q: Why do we call e.preventDefault() in form onSubmit handlers in React?</b><br/><b>A:</b> By default, HTML forms submit by refreshing the browser and appending query parameters to the URL. e.preventDefault() stops this reload so React can handle submission asynchronously.",
         "[ ] Understand controlled components<br/>[ ] Can implement input validation<br/>[ ] Can handle form submission cleanly", "3.0"),

        (10, "Client-Side Routing: React Router & Protected Routes",
         "Master React Router DOM v6, nested layouts, programmatic navigation (useNavigate), and Protected Route authorization wrappers.",
         "BrowserRouter, Routes, Route, Link vs a href, useNavigate hook, useLocation hook, ProtectedRoute guard pattern, URL parameters (:id).",
         "HireNovaAI protects private pages (/dashboard, /analytics, /mock-interview) so unauthenticated users are automatically redirected to /login.",
         "A ProtectedRoute component checks if a valid JWT token exists in localStorage. If yes, it renders children; otherwise, it redirects to login.",
         "client/src/App.jsx (Route definitions & ProtectedRoute wrapper), client/src/components/Sidebar.jsx (useLocation() for active menu highlight).",
         "Open client/src/App.jsx. Trace what happens when a user attempts to manually type 'http://localhost:5173/dashboard' into the browser without logging in.",
         "Explain why we use Link to='/notes' instead of a href='/notes' in React applications.",
         "<b>Q: How does a Protected Route work in React Router?</b><br/><b>A:</b> It is a wrapper component that checks the user's authentication state. If logged in, it renders children; if not, it navigates the user back to the landing or login page.",
         "[ ] Mastered React Router syntax<br/>[ ] Know how Protected Routes secure private views<br/>[ ] Can use useNavigate for redirection", "3.0"),

        (11, "Modern UI Styling: Tailwind CSS & Design Tokens",
         "Learn Tailwind CSS utility classes, responsive breakpoints (sm, md, lg), flexbox/grid layouts, and the HireNovaAI purple palette.",
         "Tailwind utility classes, Flexbox (flex, items-center, justify-between), Grid (grid-cols-1 md:grid-cols-2), Spacing (p-4, m-2, gap-4), Responsive design (md:hidden, md:flex).",
         "HireNovaAI's sleek Canva-inspired visual aesthetic (#EFE9FE background, #6C47FF primary purple, glassmorphic cards) is built 100% with utility classes.",
         "Tailwind eliminates the need for separate .css stylesheets by providing atomic classes directly inside JSX className strings.",
         "client/tailwind.config.js (theme colors), client/src/pages/ResumeAnalyzerPage.jsx (responsive badge flex items-center justify-between md:justify-center).",
         "Inspect the responsive classes in ResumeAnalyzerPage.jsx where the AI Resume Intelligence badge centers on desktop (md:justify-center) but stays spaced on mobile.",
         "Write a Tailwind JSX snippet for a card with white background, rounded corners (rounded-2xl), subtle shadow (shadow-sm), and hover transition.",
         "<b>Q: What are the advantages of using utility-first CSS (Tailwind) over traditional CSS?</b><br/><b>A:</b> It eliminates naming fatigue, prevents global CSS collisions, speeds up responsive prototyping with prefixes like md: and lg:, and produces tiny production bundle sizes via unused CSS purging.",
         "[ ] Can build responsive Flexbox and Grid layouts<br/>[ ] Know Tailwind breakpoint prefixes (sm, md, lg)<br/>[ ] Mastered HireNovaAI styling tokens", "2.5"),

        (12, "Data Visualization: Recharts & Analytics Dashboards",
         "Learn to render interactive charts using Recharts: PieChart (difficulty distributions), BarChart (study tasks), and LineChart (ATS scores over time).",
         "Recharts component hierarchy (ResponsiveContainer, PieChart, BarChart, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend), Chart data shaping.",
         "AnalyticsPage and DashboardPage aggregate user preparation metrics into visual charts, giving students an instant overview of their readiness.",
         "Recharts takes raw JavaScript object arrays (e.g. [{ name: 'Easy', value: 15 }, { name: 'Medium', value: 8 }]) and converts them into reactive SVG charts.",
         "client/src/pages/AnalyticsPage.jsx (DSA difficulty PieChart, Task tracker BarChart, ATS History LineChart).",
         "Inspect lines 220-240 in AnalyticsPage.jsx: see how dsaStats array is passed to Pie chart with custom color fills.",
         "Create a sample array of weekly study hours [{day: 'Mon', hours: 2}, {day: 'Tue', hours: 3.5}] and format it for a Recharts BarChart.",
         "<b>Q: Why must Recharts components be wrapped in a ResponsiveContainer?</b><br/><b>A:</b> It allows the chart to automatically scale its width and height to fit any parent container size across mobile, tablet, and widescreen desktop monitors.",
         "[ ] Understand Recharts data formatting<br/>[ ] Can render Pie, Bar, and Line charts<br/>[ ] Know how Tooltips and Legends work", "3.5"),

        (13, "Node.js Fundamentals: Runtime & Event Loop",
         "Understand what Node.js is, how the V8 engine executes JavaScript on the server, asynchronous I/O, and environment variables.",
         "Node.js runtime environment, V8 Engine, Non-blocking asynchronous I/O, Event Loop, Global objects (process, __dirname), process.env.",
         "The backend server (server.js) runs on Node.js, allowing the same JavaScript language to power both client and server layers seamlessly.",
         "Node.js runs single-threaded with an event loop that delegates heavy operations (database queries, network requests) to worker threads without blocking.",
         "server/server.js (dotenv.config() loading process.env.PORT, process.env.MONGO_URI).",
         "Create a small test.js file that reads process.env.NODE_ENV and prints 'Running in Development Mode' using node test.js in terminal.",
         "Explain why Node.js is considered highly scalable for I/O-heavy applications like chat and AI portals.",
         "<b>Q: How does the Node.js Event Loop handle multiple concurrent requests with only a single main thread?</b><br/><b>A:</b> Node offloads non-blocking asynchronous tasks (like database queries and network calls) to the system kernel or thread pool. When the task completes, a callback is queued and executed on the main thread.",
         "[ ] Understand the Node.js runtime concept<br/>[ ] Know how process.env loads environment variables<br/>[ ] Understand non-blocking event-driven architecture", "3.0"),

        (14, "Express.js Framework: Server, REST APIs & HTTP Verbs",
         "Build RESTful APIs with Express.js, configure routing endpoints, and understand HTTP Request (req) and Response (res) objects.",
         "Express app initialization, app.listen(port), REST API design principles, HTTP Methods (GET, POST, PUT, DELETE), req.body, req.params, req.query, res.json(), res.status().",
         "Every single feature in HireNovaAI communicates with the backend through Express REST API routes under the /api namespace.",
         "REST (Representational State Transfer) uses standard HTTP methods: GET to read, POST to create, PUT to update, and DELETE to remove resources.",
         "server/server.js (app.use('/api/questions', ...)), server/routes/questionRoutes.js (router.route('/').get(...).post(...)).",
         "Inspect server/server.js line 65: see how app.get('/', (req, res) => res.json({ success: true, message: 'API is running' })) acts as a health check endpoint.",
         "Write an Express route that accepts a URL parameter req.params.id and returns a JSON response { id: req.params.id, status: 'Active' }.",
         "<b>Q: What is the difference between req.params, req.query, and req.body in Express?</b><br/><b>A:</b> req.params contains route parameters (/users/:id), req.query contains URL query strings (/users?role=admin), and req.body contains JSON payloads sent in POST/PUT requests.",
         "[ ] Can create an Express HTTP server<br/>[ ] Understand RESTful route conventions<br/>[ ] Master req.body and res.status().json()", "3.5"),

        (15, "Backend Architecture: Routes, Controllers & MVC",
         "Learn clean backend code organization: separating Route definitions from Controller logic and Model data layers (MVC pattern).",
         "Separation of Concerns, MVC Pattern (Model-View-Controller), Express Router (express.Router()), Controller handler functions, asyncHandler wrapper.",
         "HireNovaAI maintains clean code by keeping route endpoints in server/routes/ and database/AI logic in server/controllers/.",
         "Routes define *which* URL triggers an action; Controllers contain the *logic* executed when triggered; Models define the *data structure* in MongoDB.",
         "server/routes/noteRoutes.js (maps URLs to noteController), server/controllers/noteController.js (exports getNotes, createNote, deleteNote).",
         "Open server/routes/interviewRoutes.js and trace how router.post('/start', startInterview) delegates execution directly to interviewController.js.",
         "Explain why placing database queries directly inside route files leads to unmaintainable 'spaghetti code'.",
         "<b>Q: Why do we separate Route definitions from Controllers in Express?</b><br/><b>A:</b> It adheres to the Single Responsibility Principle, keeps route files readable as an API index, and makes controller functions easily testable and reusable.",
         "[ ] Understand MVC architecture in Express<br/>[ ] Can organize routes and controllers in separate folders<br/>[ ] Know how router.use() mounts sub-routers", "3.0"),

        (16, "Express Middlewares: CORS, JSON Parsing & Error Pipeline",
         "Master the Express middleware pipeline (req, res, next), CORS cross-origin configuration, and centralized error handling.",
         "Middleware concept (functions in the request pipeline), next() function, Built-in middleware (express.json()), Third-party middleware (cors), Centralized Error Middleware.",
         "Without CORS middleware, your browser blocks the Vercel frontend from making requests to the Render backend; without JSON middleware, req.body is undefined.",
         "Middlewares execute sequentially. They can modify req/res objects, end the request early (e.g. auth check), or pass control to the next middleware via next().",
         "server/server.js (CORS configuration allowing localhost and .vercel.app), server/middleware/errorHandler.js (catches server exceptions).",
         "Inspect lines 30-45 of server/server.js to see how allowedOrigins array filters requests and permits Vercel domains.",
         "Write a custom Express middleware that logs the HTTP method, URL, and timestamp of every incoming request to the server console.",
         "<b>Q: What is CORS and why does a full-stack MERN app require it?</b><br/><b>A:</b> Cross-Origin Resource Sharing (CORS) is a browser security mechanism that blocks requests made to a different domain/port. CORS middleware tells the browser that our backend explicitly trusts the frontend origin.",
         "[ ] Understand how middleware works with next()<br/>[ ] Know how CORS protects APIs<br/>[ ] Can configure global error handling middleware", "3.5"),

        (17, "Authentication & Security: Password Hashing & JWT Tokens",
         "Master end-to-end user authentication: password salting/hashing with bcryptjs and stateless session authorization with JSON Web Tokens (JWT).",
         "Password Hashing vs Plaintext, Salt rounds, bcrypt.hash(), bcrypt.compare(), JWT structure (Header.Payload.Signature), jwt.sign(), jwt.verify(), Bearer authorization header.",
         "HireNovaAI protects student accounts so passwords are never stored in plaintext and private endpoints require a verified JWT token in the Authorization header.",
         "On signup/login, Express signs a JWT with the user's ID and JWT_SECRET. The client saves this token in localStorage and sends it in headers: Bearer token.",
         "server/controllers/authController.js (login/register token generation), server/middleware/authMiddleware.js (protect route middleware).",
         "Inspect server/middleware/authMiddleware.js: trace how it splits req.headers.authorization, verifies the token with jwt.verify, and attaches req.user.",
         "Draw a flow diagram on paper tracing the full lifecycle of a user login from form submission to protected route access.",
         "<b>Q: Why should we never store passwords in plaintext in a database?</b><br/><b>A:</b> If the database is compromised, plaintext passwords expose users immediately. bcrypt hashes passwords with a unique salt via one-way cryptographic algorithms, making them irreversible.",
         "[ ] Understand bcrypt password hashing<br/>[ ] Know the 3 parts of a JWT token<br/>[ ] Can explain the protect authMiddleware function", "4.0"),

        (18, "File Uploads & Processing: Multer & PDF Text Extraction",
         "Learn multipart/form-data file handling with Multer, file validation (PDF mime-types), and extracting raw text with pdf-parse for AI ATS scoring.",
         "multipart/form-data encoding, Multer middleware, diskStorage vs memoryStorage, File filter validation, Buffer streams, pdf-parse library.",
         "The Resume Analyzer requires users to upload physical PDF documents from their laptops, which Express processes in memory to extract text for Groq AI.",
         "Standard express.json() only parses text. Multer intercepts multipart form streams, validates the file extension/size, and attaches req.file to the controller.",
         "server/routes/resumeRoutes.js (upload.single('resume')), server/controllers/resumeController.js (pdf-parse extracting rawText).",
         "Open server/controllers/resumeController.js and locate the pdf(dataBuffer) call that extracts text from the uploaded PDF before passing it to Groq AI.",
         "Explain what security checks you should perform on uploaded files (e.g. file size limits, MIME-type whitelisting) to protect the server.",
         "<b>Q: Why do we use Multer when uploading resumes instead of standard express.json()?</b><br/><b>A:</b> Standard JSON parsers cannot handle binary file streams. Multer is specifically designed to parse multipart/form-data payloads and extract file buffers securely.",
         "[ ] Understand multipart/form-data requests<br/>[ ] Can configure Multer storage and file filters<br/>[ ] Know how pdf-parse extracts text buffers", "3.5"),

        (19, "MongoDB & NoSQL Fundamentals: Collections & Documents",
         "Understand NoSQL document databases, how MongoDB stores data in BSON format, and comparing SQL tables vs MongoDB collections.",
         "SQL (Relational) vs NoSQL (Document), MongoDB Database, Collection, Document, Field, JSON vs BSON (Binary JSON), Primary Key (_id ObjectId).",
         "HireNovaAI stores diverse data structures (user profiles, nested interview messages, multi-category tasks) that benefit from MongoDB's flexible document schema.",
         "In MongoDB, data is stored as BSON documents inside collections (equivalent to SQL rows inside tables). Documents can store nested objects and arrays natively.",
         "MongoDB Atlas Web Dashboard -> Cluster0 -> placement-prep-portal database -> users and questions collections.",
         "Log into your MongoDB Atlas dashboard and inspect a document in the questions collection. Identify the _id, user ObjectId, and timestamp fields.",
         "Write down a sample MongoDB document for a student user with name, email, targetRole, and an array of skills.",
         "<b>Q: What are the main differences between SQL tables and MongoDB collections?</b><br/><b>A:</b> SQL databases use rigid schemas with fixed columns and relational foreign keys, whereas MongoDB uses flexible schema-less JSON/BSON documents that can easily store nested arrays and objects.",
         "[ ] Understand SQL vs NoSQL differences<br/>[ ] Know what a Document and Collection are<br/>[ ] Understand MongoDB _id ObjectId", "2.5"),

        (20, "Mongoose ODM: Schemas, Models & Validation",
         "Master Mongoose Object Data Modeling (ODM) in Node.js: defining Schemas, creating Models, data validation rules, and automatic timestamps.",
         "Mongoose library, mongoose.Schema, mongoose.model, Schema Types (String, Number, Boolean, Date, ObjectId), Validation (required, enum, trim, min, max), timestamps: true.",
         "Every entity stored in HireNovaAI (Users, Tasks, Resumes, Notes, Interviews) has a strict Mongoose schema defining field types and validation constraints.",
         "A Mongoose Schema is the architectural blueprint defining fields and validation; a Model is the compiled construct used to query and create documents in the database.",
         "server/models/Question.js (difficulty enum: ['Easy', 'Medium', 'Hard']), server/models/Task.js (priority enum: ['low', 'medium', 'high']).",
         "Open server/models/Question.js and identify the enum array that restricts the allowed difficulty levels and topic names.",
         "Write a Mongoose schema for a Bookmark model with title (required string), url (required string), and createdAt timestamp.",
         "<b>Q: What is the benefit of using Mongoose over the raw native MongoDB driver?</b><br/><b>A:</b> Mongoose provides schema validation, type casting, middleware hooks, and business logic methods, ensuring that invalid data cannot be saved to the database.",
         "[ ] Can define Mongoose Schemas with validation<br/>[ ] Understand Schema Types and Enums<br/>[ ] Know how timestamps: true works", "3.5"),

        (21, "Mongoose CRUD Operations & Database Queries",
         "Master all Mongoose CRUD operations: Model.create(), find(), findById(), updateOne(), updateMany(), deleteMany(), and sorting.",
         "Create (create(), save()), Read (find(), findOne(), findById()), Update (findByIdAndUpdate(), updateMany()), Delete (findByIdAndDelete(), deleteMany()), Query filters ($set, sort, limit).",
         "All user actions (adding a DSA problem, marking a study task complete, deleting past mock interviews, resetting analytics) execute Mongoose CRUD queries.",
         "Mongoose methods are asynchronous and return Promises. You await the result (e.g. const questions = await Question.find({ user: userId })).",
         "server/controllers/questionController.js (Question.find, Question.create, Question.findByIdAndDelete), server/controllers/analyticsController.js (updateMany).",
         "Inspect server/controllers/analyticsController.js: trace how resetAnalytics uses Question.updateMany({ user: userId }, { status: 'to-do' }) to reset progress.",
         "Write a Mongoose query that finds all tasks for a specific user where status is 'pending', sorted by dueDate ascending.",
         "<b>Q: What is the difference between findOne() and find() in Mongoose?</b><br/><b>A:</b> find() returns an array of all documents that match the query filter (or an empty array []), whereas findOne() returns the single first matching document (or null).",
         "[ ] Mastered Model.create, find, update, and delete<br/>[ ] Can filter queries by user ObjectId<br/>[ ] Understand sorting and query modifiers", "3.5"),

        (22, "MongoDB Atlas Cloud Configuration & Production Security",
         "Learn how MongoDB Atlas cloud clusters work, secure connection strings (MONGO_URI), network IP whitelisting (0.0.0.0/0), and database connection troubleshooting.",
         "MongoDB Atlas Cloud Cluster, Connection String URI format, Database user credentials, Network Access IP Whitelist (0.0.0.0/0), Connection Pooling, Error Handling.",
         "In production, your Render backend server needs to connect securely to your MongoDB Atlas cloud database cluster without being blocked by IP firewalls.",
         "MONGO_URI format: mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database>?retryWrites=true&w=majority. IP whitelisting allows Render to connect.",
         "server/config/db.js (mongoose.connect), server/.env (MONGO_URI).",
         "Review Step 5 from our deployment: verify that 0.0.0.0/0 (Allow Access from Anywhere) is active in your MongoDB Atlas Network Access panel.",
         "Explain what happens if your MongoDB Atlas password contains special characters like '@' or '#' and how to URL-encode them.",
         "<b>Q: Why must we add 0.0.0.0/0 to MongoDB Atlas Network Access when deploying on Render?</b><br/><b>A:</b> Render's free tier uses dynamic cloud server IPs that change frequently. Whitelisting 0.0.0.0/0 allows authorized connections from any cloud server IP with valid credentials.",
         "[ ] Understand MongoDB Atlas connection strings<br/>[ ] Know how Network Access IP whitelisting works<br/>[ ] Can debug MongoDB connection timeouts", "2.5"),

        (23, "AI Fundamentals: LLMs, Groq API & Prompt Engineering",
         "Understand Large Language Models (LLMs), tokenization, system vs user prompts, low-latency Groq hardware (LPUs), and structured JSON output.",
         "Large Language Models (LLMs), Groq Cloud API, LPU (Language Processing Unit), llama-3.3-70b-versatile, System Instructions vs User Prompt, Temperature parameter, JSON Mode.",
         "HireNovaAI upgraded from Gemini to Groq LLaMA 3.3 for lightning-fast sub-second AI responses during live speech mock interviews and resume scoring.",
         "An LLM takes a prompt (context instructions) and generates the most statistically probable completion. Low temperature (0.2) gives precise structured outputs.",
         "server/utils/groqClient.js (Groq SDK initialization), server/controllers/interviewController.js (system prompts).",
         "Inspect server/controllers/resumeController.js: observe how the prompt strictly commands Groq to output valid JSON: { atsScore: 85, feedback: { ... } }.",
         "Write a system prompt designed to act as a strict Senior Technical Interviewer for a Frontend React Developer position.",
         "<b>Q: What is the purpose of a System Prompt in an AI API call?</b><br/><b>A:</b> A system prompt establishes the AI's persona, rules, constraints, grading criteria, and output formatting (e.g. 'You are a senior tech recruiter. Output JSON only.').",
         "[ ] Understand LLMs and Groq LPUs<br/>[ ] Know the role of System vs User prompts<br/>[ ] Can instruct AI to return pure JSON objects", "3.5"),

        (24, "HireNovaAI AI Features: Resume Scanner & Mock Interviews",
         "Deep-dive into the exact implementation of HireNovaAI's AI modules: ATS Resume Analyzer, Voice Mock Interviews, and Smart AI Notes Assistant.",
         "Multi-turn AI conversation transcripts, Speech-to-Text (STT Web Speech API), Text-to-Speech (TTS SpeechSynthesis API), ATS Scoring algorithms, Concept Summarization.",
         "These AI features provide the core value proposition of HireNovaAI, turning standard tracking portals into an active intelligent career coach.",
         "The client records student voice via STT -> sends text to Express -> Express passes transcript history to Groq -> Groq evaluates answer quality -> client speaks response with TTS.",
         "client/src/pages/InterviewPage.jsx (Voice STT/TTS), server/controllers/interviewController.js, server/controllers/resumeController.js.",
         "Open client/src/pages/InterviewPage.jsx: trace how the browser's window.SpeechRecognition captures audio input and passes transcribed text to the backend.",
         "Explain step-by-step how a PDF resume is transformed from raw bytes to an ATS score of 85% on the user's screen.",
         "<b>Q: How does the AI Mock Interview maintain conversation context across multiple turns?</b><br/><b>A:</b> The backend stores previous conversation messages in the Interview document and passes the full message history array to Groq on each turn so the AI remembers context.",
         "[ ] Understand AI multi-turn conversational history<br/>[ ] Know how Web Speech STT and TTS integrate with React<br/>[ ] Can trace the full Resume ATS scoring pipeline", "4.0"),

        (25, "AI Reliability, Rate Limits & Fallback Error Handling",
         "Master AI error handling: catching malformed JSON, handling Groq API rate limits (HTTP 429), managing timeouts, and providing graceful fallback UI.",
         "Groq rate limits (RPM / TPM), JSON.parse() error handling, Fallback regex cleaners (removing ```json markdown fences), Loading skeletons, Network retries.",
         "AI APIs can occasionally return markdown formatting or timeout during peak load. Robust fallback logic ensures HireNovaAI never crashes or shows a blank screen.",
         "Always wrap JSON.parse(aiResponse) in try/catch. If parsing fails, use regex to extract pure JSON or return a structured fallback object.",
         "server/controllers/resumeController.js (JSON cleanup regex), server/controllers/interviewController.js (error response handlers).",
         "Inspect the JSON parsing safety block in resumeController.js where markdown ```json strings are stripped before JSON.parse().",
         "Write a safety helper function safeParseJSON(aiString, fallbackObj) that parses strings and returns fallbackObj if parsing throws an error.",
         "<b>Q: What happens if an AI API returns malformed JSON and how do you prevent server crashes?</b><br/><b>A:</b> A raw JSON.parse() will throw an uncaught SyntaxError and crash the server. We wrap JSON parsing in try/catch blocks and use regex sanitizers to extract JSON safely.",
         "[ ] Understand AI rate limits and timeouts<br/>[ ] Can clean markdown backticks from AI responses<br/>[ ] Know how to return safe fallback JSON to the UI", "3.0"),

        (26, "Full-Stack Integration & End-to-End System Flows",
         "Trace the complete data flow across all 4 layers of HireNovaAI: React Client <-> Axios <-> Express Server <-> MongoDB Atlas <-> Groq AI.",
         "End-to-End Integration, Data serialization, Request-Response cycle, Auth state synchronization, Cross-layer debugging.",
         "In technical interviews, recruiters evaluate your ability to trace an entire feature from the button click in React to the database document update.",
         "User clicks action -> React dispatches Axios request -> Express route routes request -> authMiddleware verifies token -> Controller queries MongoDB / calls Groq -> Response sent back -> React updates state.",
         "Complete project codebase (client/src/services/ -> server/routes/ -> server/controllers/ -> server/models/).",
         "Trace the complete lifecycle of logging a new DSA problem from the user clicking 'Add Question' in DSATrackerPage.jsx to the pie chart updating in AnalyticsPage.jsx.",
         "Draw a complete sequence diagram on paper showing React, Express, MongoDB, and Groq communicating during a Mock Interview session.",
         "<b>Q: Can you describe the end-to-end data flow when a user analyzes a resume in HireNovaAI?</b><br/><b>A:</b> React uploads a PDF via FormData to /api/resumes/analyze. Multer receives the file in Express, pdf-parse extracts raw text, Groq evaluates keywords and returns JSON feedback, Express saves the record to MongoDB, and React renders the ATS score meter.",
         "[ ] Can trace all 10 core application flows<br/>[ ] Understand how JWT binds client requests to database records<br/>[ ] Can explain full-stack data flow without looking at notes", "3.5"),

        (27, "Placement Readiness Score Algorithm & Metrics Reset",
         "Understand the mathematical Placement Readiness formula (100% weighted score) and the custom modular analytics reset architecture.",
         "Weighted scoring algorithms, Mathematical aggregations, Multi-collection batch updates, Modular reset operations (selective checkboxes).",
         "The Dashboard and Analytics pages calculate a single unified readiness percentage (0-100%) aggregating DSA, ATS score, interviews, study hours, and streaks.",
         "Readiness Formula: DSA (40%) + Peak ATS (20%) + Mock Interview (20%) + Study Hours (10%) + Daily Streak (10%) = 100%.",
         "server/controllers/analyticsController.js (getRealtimeAnalytics & resetAnalytics), client/src/pages/AnalyticsPage.jsx (Reset Modal).",
         "Open server/controllers/analyticsController.js lines 70-85 to see how each domain score is weighted and clamped between 0 and 100%.",
         "Inspect the reset modal in AnalyticsPage.jsx and identify how the user can choose to reset only DSA progress while preserving resume scan history.",
         "<b>Q: How is the Placement Readiness Score calculated in HireNovaAI?</b><br/><b>A:</b> It is a weighted formula out of 100%: 40% DSA problems solved (scaled to target of 150), 20% Peak Resume ATS score, 20% Mock Interview score average, 10% study hours logged, and 10% daily active streak.",
         "[ ] Understand the weighted readiness formula<br/>[ ] Know how batch database reset operations execute<br/>[ ] Can explain how Recharts reacts to data resets", "3.0"),

        (28, "Production Deployment: Vercel, Render & CI/CD Pipelines",
         "Understand how HireNovaAI is deployed in production: Vercel (Edge CDN Frontend), Render (Node.js Web Service), and Git CI/CD auto-deployments.",
         "Production builds (vite build), SPA Routing rewrites (vercel.json), Render Web Service settings, Environment variables in production, CORS in production.",
         "Deploying your project makes it accessible worldwide to recruiters and peers via real HTTPS URLs on desktop and mobile devices.",
         "Pushing code to GitHub main automatically triggers a build on Vercel (generating optimized dist/ assets) and Render (running npm install & node server.js).",
         "client/vercel.json (SPA rewrite rules), server/server.js (allowedOrigins CORS check), GitHub repository.",
         "Review your live deployments: Vercel (https://placement-prep-portal-alpha.vercel.app) and Render (https://placement-prep-portal-v3w5.onrender.com).",
         "Explain what would happen if client/vercel.json were missing when a user refreshes the page on https://placement-prep-portal-alpha.vercel.app/dashboard.",
         "<b>Q: Why do we need vercel.json rewrites for a React Single Page Application?</b><br/><b>A:</b> In an SPA, routes like /dashboard exist only in JavaScript memory, not as physical files on the server. vercel.json redirects all URL requests to index.html so React Router can handle routing client-side.",
         "[ ] Understand Vercel and Render deployment architecture<br/>[ ] Know how GitHub triggers automated CI/CD builds<br/>[ ] Can configure production environment variables", "3.5"),

        (29, "Systematic Debugging & Full-Stack Troubleshooting",
         "Master the 11-step professional debugging methodology: reproducing bugs, inspecting Network payloads, reading server logs, and fixing CORS/Auth errors.",
         "Browser Console errors, Network Tab inspection (Headers, Payload, Response), Server terminal logs, HTTP Status Codes (400, 401, 403, 404, 500), CORS debugging.",
         "In development and interviews, being able to systematically isolate and fix bugs is the hallmark of a confident software engineer.",
         "1. Reproduce issue -> 2. Check Browser Console -> 3. Inspect Network Tab Status & Payload -> 4. Check Backend Terminal Logs -> 5. Verify Database Document -> 6. Inspect Environment Variables.",
         "client/src/services/api.js (response interceptors catching 401 errors), server/middleware/errorHandler.js.",
         "Simulate an error: enter an incorrect password on login and use DevTools Network tab to inspect the exact 401 JSON error payload sent by Express.",
         "Troubleshoot a scenario where Render backend spins down on inactivity (cold start) and explain how the client should handle initial request delays.",
         "<b>Q: If your frontend shows 'Network Error' when making an API call, what steps would you take to debug it?</b><br/><b>A:</b> 1. Check if backend server is running; 2. Verify VITE_API_URL points to the correct backend port/domain; 3. Inspect browser console for CORS block errors; 4. Check Network tab for status code or failed connection.",
         "[ ] Mastered the 11-step debugging workflow<br/>[ ] Know how to diagnose 401, 404, 500, and CORS errors<br/>[ ] Can read client and server stack traces confidently", "3.5"),

        (30, "Interview Mastery & Technical Project Presentation",
         "Master presenting HireNovaAI to technical interviewers with high confidence: 30-second elevator pitch, 2-minute technical overview, and deep-dive architecture mastery.",
         "STAR methodology (Situation, Task, Action, Result), Architectural trade-offs, Technical challenges & solutions, Scalability improvements, Confident project storytelling.",
         "This is the capstone day where all your 30 days of learning culminate into an articulate, interview-ready presentation that impresses hiring managers.",
         "Structure your project explanation around: Problem Statement -> Solution Architecture -> Key Innovations (Groq AI, STT/TTS, Recharts) -> Technical Challenges Solved -> Future Roadmap.",
         "Entire HireNovaAI Repository & Documentation.",
         "Record yourself on your phone giving a 2-minute spoken technical explanation of HireNovaAI. Listen to it and refine your pacing and clarity.",
         "Practice answering: 'What was the single most difficult technical bug you solved while building HireNovaAI?' using the STAR method.",
         "<b>Q: Give a 1-minute technical summary of HireNovaAI.</b><br/><b>A:</b> 'HireNovaAI is an AI-powered placement preparation platform built on the MERN stack and Groq LLaMA 3.3. It features an interactive speech-enabled Mock Interview room with real-time answer grading, an ATS Resume Intelligence analyzer with PDF parsing, a DSA practice tracker with Recharts visual distributions, and a study task habit planner. The frontend is built in React 18 and Vite deployed on Vercel, connecting via Axios and JWT authentication to an Express REST API on Render backed by MongoDB Atlas.'",
         "[ ] Can deliver 30-second, 1-minute, and 5-minute project pitches<br/>[ ] Can answer every technical architecture question confidently<br/>[ ] 100% READY TO ACE PLACEMENT & TECHNICAL INTERVIEWS! 🚀", "4.0")
    ]

    for d in days_data:
        day_elements = render_day(d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8], d[9], d[10], d[11])
        for elem in day_elements:
            story.append(elem)

    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 8: COMMON ERRORS & TROUBLESHOOTING CHEAT SHEET
    # ══════════════════════════════════════════════════════════════════════════
    story.append(safe_p("8. Common Errors & Troubleshooting Guide", style_h1))
    story.append(safe_p("A comprehensive diagnostic cheat sheet covering every common development and production error:", style_body))
    story.append(Spacer(1, 4))

    errors_data = [
        [safe_p("Error / Symptom", style_table_header), safe_p("Root Cause", style_table_header), safe_p("How to Diagnose", style_table_header), safe_p("Fix / Resolution", style_table_header)],
        [safe_p("<b>CORS Policy Block</b><br/>'Access to fetch at ... has been blocked by CORS policy'", style_table_cell), safe_p("Backend server does not list frontend origin in allowed CORS headers", style_table_cell), safe_p("Red error in Chrome DevTools Console; Network tab status: (failed)", style_table_cell), safe_p("In server.js, add frontend domain (https://placement-prep-portal-alpha.vercel.app) to allowedOrigins array in cors()", style_table_cell)],
        [safe_p("<b>401 Unauthorized</b>", style_table_cell), safe_p("JWT token is missing, expired, or signed with an invalid JWT_SECRET", style_table_cell), safe_p("Network tab response: { success: false, message: 'Not authorized' }", style_table_cell), safe_p("Log in again to regenerate token; verify client sends Authorization: Bearer token header and JWT_SECRET matches in server .env", style_table_cell)],
        [safe_p("<b>404 Not Found on Reload (Vercel)</b>", style_table_cell), safe_p("Client-side sub-route refreshed on Vercel without SPA rewrite rule", style_table_cell), safe_p("Navigating works, but pressing F5 on /dashboard shows Vercel 404 page", style_table_cell), safe_p("Create client/vercel.json with { 'rewrites': [{ 'source': '/(.*)', 'destination': '/index.html' }] } and push to GitHub", style_table_cell)],
        [safe_p("<b>MongoDB Connection Timeout / MongooseServerSelectionError</b>", style_table_cell), safe_p("IP address not whitelisted in MongoDB Atlas or incorrect MONGO_URI", style_table_cell), safe_p("Render logs: MongoServerError: IP not authorized or connection timed out", style_table_cell), safe_p("Go to MongoDB Atlas -> Network Access -> Add IP Address -> Select 'Allow Access from Anywhere' (0.0.0.0/0)", style_table_cell)],
        [safe_p("<b>500 Internal Server Error (Resume Analysis)</b>", style_table_cell), safe_p("pdf-parse failed to extract text or Groq returned invalid JSON", style_table_cell), safe_p("Backend Render logs show SyntaxError: Unexpected token in JSON.parse", style_table_cell), safe_p("Wrap Groq AI response in regex cleaner (replace(/```json/g, '')) and wrap JSON.parse in try/catch fallback", style_table_cell)],
        [safe_p("<b>Render Cold Start Delay (50-60s initial load)</b>", style_table_cell), safe_p("Render free tier spins down web services after 15 minutes of inactivity", style_table_cell), safe_p("First API call after idle period takes ~50s to respond while server wakes up", style_table_cell), safe_p("Expected on free tier. Display a friendly loading indicator on frontend while waking up backend service", style_table_cell)],
        [safe_p("<b>VITE_API_URL Undefined / Network Error</b>", style_table_cell), safe_p("Environment variable missing on Vercel or lacks VITE_ prefix in Vite", style_table_cell), safe_p("Network tab shows requests going to http://localhost:5000 in production", style_table_cell), safe_p("In Vercel Dashboard -> Settings -> Environment Variables, add VITE_API_URL = https://placement-prep-portal-v3w5.onrender.com/api and redeploy", style_table_cell)]
    ]
    t_err = Table(errors_data, colWidths=[110, 130, 130, 170])
    t_err.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_CARD]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_err)
    story.append(Spacer(1, 10))

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 9: INTERVIEW PROJECT PRESENTATION SCRIPTS
    # ══════════════════════════════════════════════════════════════════════════
    story.append(safe_p("9. Polished Interview Presentation Scripts", style_h1))
    story.append(safe_p("Use these structured, natural scripts tailored for campus placements and technical interviews:", style_body))
    story.append(Spacer(1, 4))

    script_30s = (
        "<b>30-SECOND ELEVATOR PITCH:</b><br/>"
        "“HireNovaAI is an AI-powered placement preparation platform built on the MERN stack and Groq LLaMA 3.3. "
        "It helps college students prepare for technical recruitments through real-time voice AI mock interviews, "
        "instant ATS resume scoring, algorithmic DSA progress tracking, and personalized habit planners. "
        "The platform is fully live with React on Vercel and Express on Render.”"
    )
    t_30s = Table([[safe_p(script_30s, style_callout)]], colWidths=[540])
    t_30s.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), C_BG_CARD), ('BORDER', (0,0), (-1,-1), 1, C_PRIMARY), ('PADDING', (0,0), (-1,-1), 6)]))
    story.append(t_30s)
    story.append(Spacer(1, 6))

    script_2m = (
        "<b>2-MINUTE TECHNICAL DEEP-DIVE SCRIPT:</b><br/>"
        "“I built HireNovaAI to address the fragmented nature of campus placement preparation, where students juggle separate tools for DSA tracking, resume optimization, and mock interview practice.<br/><br/>"
        "<b>Architecture &amp; Tech Stack:</b> On the frontend, I engineered a Single Page Application using React 18, Vite, and Tailwind CSS, utilizing Recharts for multi-metric progress visualizations. "
        "The backend is a RESTful API powered by Node.js and Express, connected to a MongoDB Atlas cloud database through Mongoose models.<br/><br/>"
        "<b>AI &amp; Speech Integration:</b> For the Mock Interview room, I integrated Groq's low-latency LLaMA-3.3-70B model combined with the browser's Web Speech API for seamless Speech-to-Text and Text-to-Speech interaction. "
        "For the Resume Analyzer, Multer intercepts PDF uploads, pdf-parse extracts the raw text buffer, and Groq evaluates keyword match rates against target job descriptions, outputting structured ATS feedback.<br/><br/>"
        "<b>Security &amp; Deployment:</b> User authentication is secured using bcrypt password hashing and stateless JWT tokens passed via Axios request interceptors. "
        "The application is deployed with automated CI/CD pipelines on Vercel (frontend) and Render (backend).”"
    )
    t_2m = Table([[safe_p(script_2m, style_callout)]], colWidths=[540])
    t_2m.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFE9FE")), ('BORDER', (0,0), (-1,-1), 1, C_PRIMARY), ('PADDING', (0,0), (-1,-1), 8)]))
    story.append(t_2m)
    
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════════════
    # SECTION 10: FINAL 17-QUESTION SELF-ASSESSMENT TEST
    # ══════════════════════════════════════════════════════════════════════════
    story.append(safe_p("10. Final “Can I Explain My Project?” Self-Test", style_h1))
    story.append(safe_p("Test your technical mastery before your interviews. Score yourself on conceptual understanding:", style_body))
    story.append(Spacer(1, 4))

    quiz_data = [
        [safe_p("#", style_table_header), safe_p("Technical Question", style_table_header), safe_p("Key Points You Must Mention in Interview", style_table_header), safe_p("Self-Rating", style_table_header)],
        [safe_p("1", style_table_cell), safe_p("What is HireNovaAI and why did you build it?", style_table_cell), safe_p("AI career companion solving fragmented prep tools (DSA + Resume ATS + Voice Mock Interviews + Habit Planner)", style_table_cell), safe_p("[ ] Mastered", style_table_cell)],
        [safe_p("2", style_table_cell), safe_p("What happens under the hood when a user logs in?", style_table_cell), safe_p("React sends credentials via Axios -> Express authController finds user -> bcrypt.compare() checks hash -> jwt.sign() creates token -> Token saved in localStorage", style_table_cell), safe_p("[ ] Mastered", style_table_cell)],
        [safe_p("3", style_table_cell), safe_p("How does React communicate with Express securely?", style_table_cell), safe_p("Axios interceptor attaches Authorization: Bearer token to every HTTP request; Express authMiddleware verifies token with JWT_SECRET", style_table_cell), safe_p("[ ] Mastered", style_table_cell)],
        [safe_p("4", style_table_cell), safe_p("How does the Resume Analyzer process PDFs and calculate scores?", style_table_cell), safe_p("Multer handles multipart upload -> pdf-parse extracts raw text buffer -> Groq LLaMA 3.3 scores ATS compatibility against JD -> Saved to MongoDB", style_table_cell), safe_p("[ ] Mastered", style_table_cell)],
        [safe_p("5", style_table_cell), safe_p("Why did you choose Groq AI over traditional APIs?", style_table_cell), safe_p("Groq's LPU hardware delivers ultra-low-latency sub-second response times, essential for natural real-time speech conversation during mock interviews", style_table_cell), safe_p("[ ] Mastered", style_table_cell)],
        [safe_p("6", style_table_cell), safe_p("How does the AI Mock Interview handle voice interactions?", style_table_cell), safe_p("Browser Web Speech API (window.SpeechRecognition) converts speech to text -> sends answer to Express -> Groq grades turn -> browser SpeechSynthesis speaks response", style_table_cell), safe_p("[ ] Mastered", style_table_cell)],
        [safe_p("7", style_table_cell), safe_p("How are passwords secured in your database?", style_table_cell), safe_p("bcryptjs generates a cryptographic salt and hashes the password with 10 salt rounds before saving to MongoDB Atlas. Passwords are never stored in plaintext", style_table_cell), safe_p("[ ] Mastered", style_table_cell)],
        [safe_p("8", style_table_cell), safe_p("How is the Placement Readiness Score calculated?", style_table_cell), safe_p("Weighted 100% formula: 40% DSA solved count + 20% Peak Resume ATS score + 20% Mock Interview average + 10% study hours + 10% daily active streak", style_table_cell), safe_p("[ ] Mastered", style_table_cell)],
        [safe_p("9", style_table_cell), safe_p("How does the modular Analytics Reset feature work?", style_table_cell), safe_p("Express endpoint /api/analytics/reset receives selective boolean options and executes targeted updateMany() or deleteMany() operations across collections", style_table_cell), safe_p("[ ] Mastered", style_table_cell)],
        [safe_p("10", style_table_cell), safe_p("How does your application handle routing in production on Vercel?", style_table_cell), safe_p("vercel.json rewrite rules redirect all sub-paths (/(.*)) to index.html so React Router DOM can handle client-side routing on page refresh without 404s", style_table_cell), safe_p("[ ] Mastered", style_table_cell)],
        [safe_p("11", style_table_cell), safe_p("What was the hardest technical challenge you faced and how did you solve it?", style_table_cell), safe_p("STAR story: Handling AI JSON parsing reliability during live interview responses by implementing robust regex sanitization and fallback error handlers", style_table_cell), safe_p("[ ] Mastered", style_table_cell)],
        [safe_p("12", style_table_cell), safe_p("How would you scale HireNovaAI to 100,000 active students?", style_table_cell), safe_p("Add Redis caching for frequent dashboard stats, configure MongoDB connection pooling and indexing, use AWS S3 for PDF resume storage, scale Node with Docker", style_table_cell), safe_p("[ ] Mastered", style_table_cell)]
    ]
    t_quiz = Table(quiz_data, colWidths=[20, 160, 290, 70])
    t_quiz.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, C_BG_CARD]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_quiz)
    story.append(Spacer(1, 15))

    final_box = [
        [safe_p("<b>CONGRATULATIONS ON COMPLETING YOUR 30-DAY ROADMAP!</b><br/>"
                "You now possess complete conceptual mastery over the <b>HireNovaAI</b> platform — from Web Fundamentals and React Frontend "
                "to Express REST APIs, MongoDB Database modeling, Groq AI integration, and Cloud Production Deployment on Vercel and Render. "
                "Walk into your technical interviews with confidence — you built it, you understand it, and you are ready to excel!", style_callout)]
    ]
    t_final = Table(final_box, colWidths=[540])
    t_final.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFE9FE")),
        ('BORDER', (0,0), (-1,-1), 2, C_PRIMARY),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_final)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename}")

if __name__ == "__main__":
    build_pdf()
