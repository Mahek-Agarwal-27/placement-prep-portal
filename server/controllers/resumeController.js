const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const Resume = require('../models/Resume');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

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

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_key_here') {
    return res.status(553).json(errorResponse('Gemini API key is missing. Please configure it in .env.'));
  }

  const { jobDescription } = req.body;
  const filePath = req.file.path;
  const fileName = req.file.originalname;
  const fileUrl = `/uploads/resumes/${req.file.filename}`;

  try {
    // 1. Extract text from PDF
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    const pdfData = await parser.getText();
    const resumeText = pdfData.text;

    // 2. Build Prompt for Gemini (asking ONLY for suggestions, not score)
    const prompt = `
You are an expert technical recruiter analyzing a resume.
I am providing a candidate's parsed resume text ${jobDescription ? 'and a target Job Description' : ''}.
Analyze the resume and provide feedback in strict JSON format. Do not use markdown formatting blocks around the JSON (like \`\`\`json), just output the raw JSON string directly.

The JSON MUST match this structure exactly:
{
  "feedback": {
    "keywordMatching": ["<gap/suggestion 1>", "<gap/suggestion 2>"],
    "formatting": ["<formatting issue 1>", "<formatting issue 2>"],
    "bulletPoints": ["<bullet point rewrite suggestion 1>", "<bullet point rewrite suggestion 2>"],
    "generalAdvice": "<A short paragraph summarizing overall thoughts>"
  }
}

${jobDescription ? `\n--- TARGET JOB DESCRIPTION ---\n${jobDescription}\n` : ''}
--- CANDIDATE RESUME ---
${resumeText}
`;

    // 3. Call Gemini with a 20-second timeout and 1x retry on failure
    const generateWithTimeoutAndRetry = async (promptText) => {
      let attempt = 1;
      const maxAttempts = 2;
      const timeoutMs = 20000;
      
      while (attempt <= maxAttempts) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API timeout: Took longer than 20s to respond.')), timeoutMs)
          );
          
          console.log(`🤖 Resume AI Attempt ${attempt}/${maxAttempts} running...`);
          const result = await Promise.race([
            model.generateContent(promptText),
            timeoutPromise
          ]);
          
          return result.response.text();
        } catch (err) {
          console.warn(`⚠️ Resume AI Attempt ${attempt} failed:`, err.message);
          if (attempt === maxAttempts) {
            throw err;
          }
          attempt++;
          // Wait 1 second before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    };

    const responseText = await generateWithTimeoutAndRetry(prompt);
    
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
      score: finalScore,
      feedback: aiAnalysis.feedback || {
        keywordMatching: [],
        formatting: [],
        bulletPoints: [],
        generalAdvice: '',
      },
    });

    res.status(201).json(successResponse(resumeEntry, 'Resume analyzed successfully.'));
  } catch (error) {
    console.error('Final Resume Analysis Error:', error);
    const errMsg = error.message || '';
    let clientMessage = 'Failed to analyze resume.';
    if (errMsg.includes('429') || errMsg.toLowerCase().includes('quota')) {
      clientMessage = 'Gemini API quota exceeded. Daily limits apply on the free tier. Please try again in 1 minute, or provide a different API key.';
    } else if (errMsg.includes('403') || errMsg.toLowerCase().includes('api key')) {
      clientMessage = 'Invalid Gemini API Key. Please verify the key value in server/.env configuration.';
    } else {
      clientMessage = errMsg || 'An error occurred while communicating with the Gemini AI service.';
    }
    res.status(500).json(errorResponse(clientMessage));
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
