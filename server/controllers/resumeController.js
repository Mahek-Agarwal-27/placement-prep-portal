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
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
exports.analyzeResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(errorResponse('Please upload a PDF resume.'));
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_key_here') {
    return res.status(503).json(errorResponse('Gemini API key is missing. Please configure it in .env.'));
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

    // 2. Build Prompt for Gemini
    const prompt = `
You are an expert technical recruiter and ATS (Applicant Tracking System) algorithm.
I am providing a candidate's parsed resume text ${jobDescription ? 'and a target Job Description' : ''}.
Analyze the resume and provide feedback in strict JSON format. Do not use markdown formatting blocks around the JSON (like \`\`\`json), just output the raw JSON string directly.

The JSON MUST match this structure exactly:
{
  "score": <number between 0 and 100 representing the overall ATS compatibility and quality>,
  "feedback": {
    "keywordMatching": ["<point 1>", "<point 2>"],
    "formatting": ["<point 1>", "<point 2>"],
    "bulletPoints": ["<point 1>", "<point 2>"],
    "generalAdvice": "<A short paragraph summarizing overall thoughts>"
  }
}

${jobDescription ? `\n--- TARGET JOB DESCRIPTION ---\n${jobDescription}\n` : ''}
--- CANDIDATE RESUME ---
${resumeText}
`;

    // 3. Call Gemini
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // Clean up response if it contains markdown formatting
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    // 4. Parse AI Response
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON:', responseText);
      return res.status(500).json(errorResponse('AI returned an invalid format. Please try again.'));
    }

    // 5. Save to Database
    const resumeEntry = await Resume.create({
      user: req.user.id,
      fileName,
      fileUrl,
      jobDescription: jobDescription || '',
      score: aiAnalysis.score || 0,
      feedback: aiAnalysis.feedback || {},
    });

    res.status(201).json(successResponse(resumeEntry, 'Resume analyzed successfully.'));
  } catch (error) {
    console.error('Resume Analysis Error:', error);
    res.status(500).json(errorResponse(error.message || 'Failed to analyze resume.'));
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
