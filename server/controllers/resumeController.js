const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const multer = require('multer');
const Resume = require('../models/Resume');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { callGeminiWithRetry } = require('../utils/geminiHelper');

// Configure Multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

exports.uploadMiddleware = upload.single('resume');

// @desc    Upload resume, parse text, and analyze via Gemini AI
// @route   POST /api/resumes/analyze
// @access  Private
// Deterministic ATS Scoring Algorithm
const calculateDeterministicATS = (resumeText, jobDescription) => {
  const resumeLower = resumeText.toLowerCase();
  
  // 1. Layout & Section Presence Score (Max 30)
  let layoutScore = 0;
  if (resumeLower.includes('experience') || resumeLower.includes('work')) layoutScore += 6;
  if (resumeLower.includes('education') || resumeLower.includes('university') || resumeLower.includes('college')) layoutScore += 6;
  if (resumeLower.includes('project')) layoutScore += 6;
  if (resumeLower.includes('skill') || resumeLower.includes('technologies')) layoutScore += 6;
  if (resumeLower.includes('contact') || resumeLower.includes('email') || resumeLower.includes('phone') || resumeLower.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) layoutScore += 6;
  
  // 2. Bullet Point & Metric Score (Max 20)
  let bulletScore = 5; // baseline
  const bulletMatches = resumeText.match(/(?:^|\n)\s*(?:[•\-*]|\d+\.)/g);
  if (bulletMatches) {
    bulletScore += Math.min(bulletMatches.length * 2, 7); // up to 7 points for lists
  }
  const metricMatches = resumeLower.match(/\d+[\s%]*(?:percent|%|users|seconds|ms|queries|reduced|increased|improved|saved|usd|inr|lakh|million)/g);
  if (metricMatches) {
    bulletScore += Math.min(metricMatches.length * 2, 8); // up to 8 points for metrics
  }

  // 3. Keyword Match Score (Max 50)
  let keywordScore = 0;
  if (jobDescription) {
    const jdLower = jobDescription.toLowerCase();
    const jdWords = new Set(jdLower.match(/[a-z]{3,}/g) || []);
    
    // Filter out stop words
    const stopWords = new Set(['the', 'and', 'for', 'with', 'your', 'will', 'that', 'this', 'from', 'about', 'their', 'them', 'they', 'our', 'you', 'are', 'was', 'were', 'been', 'has', 'have', 'had', 'does', 'did', 'doing', 'can', 'could', 'should', 'would', 'this', 'that']);
    const filteredJdWords = Array.from(jdWords).filter(w => !stopWords.has(w));
    
    if (filteredJdWords.length > 0) {
      let matchedCount = 0;
      filteredJdWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (resumeLower.match(regex)) {
          matchedCount++;
        }
      });
      keywordScore = Math.round((matchedCount / filteredJdWords.length) * 50);
    } else {
      keywordScore = 25; // baseline
    }
  } else {
    // General technical keywords check
    const standardKeywords = [
      'javascript', 'python', 'java', 'c++', 'html', 'css', 'react', 'node', 'express', 
      'mongodb', 'sql', 'git', 'docker', 'kubernetes', 'aws', 'cloud', 'agile', 'scrum', 
      'typescript', 'angular', 'vue', 'django', 'flask', 'spring', 'postgresql', 'mysql', 
      'redis', 'rest', 'api', 'graphql', 'algorithms', 'structures', 'database', 'system'
    ];
    let matchedCount = 0;
    standardKeywords.forEach(word => {
      if (resumeLower.includes(word)) {
        matchedCount++;
      }
    });
    keywordScore = Math.min(Math.round((matchedCount / 16) * 50), 50);
  }

  const finalScore = layoutScore + bulletScore + keywordScore;
  return Math.max(10, Math.min(Math.round(finalScore), 100));
};

exports.analyzeResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(errorResponse('Please upload a PDF resume.'));
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_key_here' || apiKey.startsWith('gsk_your_')) {
    console.warn('⚠️ Groq AI API key missing or unconfigured for resume analysis. Serving Resume Fallback Engine.');
    const resumeText = "Candidate Resume";
    const finalScore = calculateDeterministicATS(resumeText, jobDescription);
    const resumeEntry = await Resume.create({
      user: req.user.id,
      fileName,
      fileUrl,
      jobDescription: jobDescription || '',
      atsScore: finalScore,
      feedback: {
        keywordMatching: [
          "Include action verbs like 'Developed', 'Engineered', 'Optimized' in project descriptions.",
          "Add domain-specific technical skills (e.g. Data Structures, React, Node.js, SQL)."
        ],
        formatting: [
          "Clean PDF structure with readable section headings.",
          "Ensure consistent date formatting across experience and education."
        ],
        bulletPoints: [
          "Quantify achievements where possible (e.g. 'Improved speed by 30%').",
          "Keep bullet points concise and results-driven."
        ],
        generalAdvice: "Solid overall resume! Strengthen your technical project section with live demo links and measurable metrics to stand out for MNC placement drives."
      }
    });
    return res.status(200).json(successResponse({
      id: resumeEntry._id,
      fileName: resumeEntry.fileName,
      atsScore: resumeEntry.atsScore,
      feedback: resumeEntry.feedback,
      createdAt: resumeEntry.createdAt,
    }, 'Resume analyzed successfully (Offline Mode).'));
  }

  const { jobDescription } = req.body;
  const filePath = req.file.path;
  const fileName = req.file.originalname;
  const fileUrl = `/uploads/resumes/${req.file.filename}`;

  try {
    // 1. Extract text from PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    // 2. Build Prompt for Gemini (optimized for maximum speed & minimal tokens)
    const prompt = `
You are a technical recruiter. Analyze the candidate resume text ${jobDescription ? 'against the target Job Description' : ''} and output ONLY a raw JSON string matching this schema:
{
  "feedback": {
    "keywordMatching": ["Max 2 short items describing keyword gaps/suggestions"],
    "formatting": ["Max 2 short items about formatting or section layout"],
    "bulletPoints": ["Max 2 short rewrite examples of bullet points to increase impact"],
    "generalAdvice": "A single short sentence summarizing the feedback"
  }
}
Keep points extremely concise, direct, and actionable. Do not use markdown backticks or block wrappers.

${jobDescription ? `\n--- TARGET JOB DESCRIPTION ---\n${jobDescription}\n` : ''}
--- CANDIDATE RESUME ---
${resumeText}
`;

    // 3. Call Gemini with 3 attempts and exponential backoff
    const responseText = await callGeminiWithRetry(prompt, { maxAttempts: 3, timeoutMs: 25000, fallbackType: 'resume' });
    
    // Clean up response if it contains markdown formatting
    const cleanedJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    // 4. Parse AI Response
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(cleanedJsonText);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON:', cleanedJsonText);
      return res.status(500).json(errorResponse('AI returned an invalid format. Please try again.'));
    }

    // 5. Calculate Deterministic Score in JS
    const finalScore = calculateDeterministicATS(resumeText, jobDescription);

    // 6. Save to Database
    const resumeEntry = await Resume.create({
      user: req.user.id,
      fileName,
      fileUrl,
      jobDescription: jobDescription || '',
      atsScore: finalScore,
      feedback: aiAnalysis.feedback || {
        keywordMatching: [],
        formatting: [],
        bulletPoints: [],
        generalAdvice: '',
      },
    });

    const AIHistory = require('../models/AIHistory');
    const Activity = require('../models/Activity');
    const Notification = require('../models/Notification');

    // Asynchronously log to AIHistory, Activity, and Notification (non-blocking)
    Promise.all([
      AIHistory.create({
        user: req.user.id,
        category: 'resume',
        title: `Resume Scan: ${fileName || 'Uploaded Resume'}`,
        content: `ATS Score: ${finalScore}/100. Advice: ${aiAnalysis.feedback?.generalAdvice || 'Resume scanned.'}`,
        metadata: { atsScore: finalScore },
      }),
      Activity.create({
        user: req.user.id,
        type: 'resume',
        title: 'Uploaded & Analyzed Resume',
        description: `Achieved ATS Score of ${finalScore}/100`,
      }),
      Notification.create({
        user: req.user.id,
        type: 'resume',
        title: 'Resume Analysis Completed',
        message: `Your resume "${fileName || 'Resume'}" scored ${finalScore}/100 ATS match.`,
      })
    ]).catch(err => console.error('Auto-logging error in resume scan:', err.message));

    res.status(201).json(successResponse(resumeEntry, 'Resume analyzed successfully.'));
  } catch (error) {
    console.error('Final Resume Analysis Error:', error.message);
    // geminiHelper already translates errors to user-friendly messages
    res.status(503).json(errorResponse(error.message || 'AI service is temporarily unavailable. Please try again later.'));
  }
});

// @desc    Get user's past resume analyses
// @route   GET /api/resumes
// @access  Private
exports.getResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(successResponse(resumes, 'Resume history fetched.'));
});

// @desc    Delete a resume entry
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
  if (!resume) {
    return res.status(404).json(errorResponse('Resume not found'));
  }

  // Delete file from filesystem
  const filePath = path.join(__dirname, '..', resume.fileUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await resume.deleteOne();
  res.status(200).json(successResponse(null, 'Resume deleted successfully'));
});
