const { GoogleGenerativeAI } = require('@google/generative-ai');
const Interview = require('../models/Interview');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

// @desc    Start mock interview session and get first question
// @route   POST /api/interviews/start
// @access  Private
exports.startInterview = asyncHandler(async (req, res) => {
  const { type, topic } = req.body;

  if (!type || !topic) {
    return res.status(400).json(errorResponse('Interview type and topic are required.'));
  }

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_key_here') {
    return res.status(503).json(errorResponse('Gemini API key is missing. Please configure it in .env.'));
  }

  try {
    // 1. Create prompt for first question
    const prompt = `
You are a professional corporate recruiter conducting a mock interview.
The candidate's selected interview type is: ${type}.
The focus topic is: ${topic}.

Introduce yourself briefly as the HireNova AI Recruiter, set a professional, encouraging stage, and ask the candidate their first interview question. 
Keep your response concise, engaging, and under 100 words. Do not print any meta-data, markdown syntax, or headers. Output ONLY the recruiter's dialogue.
`;

    const result = await model.generateContent(prompt);
    const firstQuestion = result.response.text().trim();

    // 2. Create database entry
    const interview = await Interview.create({
      user: req.user.id,
      type,
      topic,
      messages: [
        {
          role: 'assistant',
          content: firstQuestion,
        },
      ],
    });

    res.status(201).json(successResponse(interview, 'Interview started successfully.'));
  } catch (error) {
    console.error('Start Interview Error:', error);
    res.status(500).json(errorResponse('Failed to start interview.'));
  }
});

// @desc    Submit candidate answer and get next question
// @route   POST /api/interviews/:id/message
// @access  Private
exports.submitResponse = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const { id } = req.params;

  if (!message || !message.trim()) {
    return res.status(400).json(errorResponse('Message content cannot be empty.'));
  }

  const interview = await Interview.findOne({ _id: id, user: req.user.id });
  if (!interview) {
    return res.status(404).json(errorResponse('Interview session not found.'));
  }

  if (interview.status === 'completed') {
    return res.status(400).json(errorResponse('This interview has already been completed.'));
  }

  try {
    // 1. Add user message to history
    interview.messages.push({ role: 'user', content: message });

    // 2. Compile recent transcript for Gemini
    const historyText = interview.messages
      .map((msg) => `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`)
      .join('\n');

    const prompt = `
You are a professional corporate recruiter conducting a mock interview.
Interview Type: ${interview.type}
Topic: ${interview.topic}

Below is the transcript of the conversation so far.
Acknowledge the candidate's last answer briefly in a natural conversational tone, and ask the next relevant follow-up question.
Keep your response professional, focused, and under 120 words. Do not output anything else other than the recruiter's dialogue.

--- TRANSCRIPT ---
${historyText}
`;

    const result = await model.generateContent(prompt);
    const nextQuestion = result.response.text().trim();

    // 3. Save interviewer question to DB
    interview.messages.push({ role: 'assistant', content: nextQuestion });
    await interview.save();

    res.status(200).json(successResponse(interview, 'Response submitted successfully.'));
  } catch (error) {
    console.error('Submit Response Error:', error);
    res.status(500).json(errorResponse('Failed to generate follow-up question.'));
  }
});

// @desc    End and evaluate the mock interview transcript
// @route   POST /api/interviews/:id/end
// @access  Private
exports.endAndEvaluate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const interview = await Interview.findOne({ _id: id, user: req.user.id });
  if (!interview) {
    return res.status(404).json(errorResponse('Interview session not found.'));
  }

  if (interview.status === 'completed') {
    return res.status(200).json(successResponse(interview, 'Interview already completed and graded.'));
  }

  try {
    // Compile full transcript
    const transcriptText = interview.messages
      .map((msg) => `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`)
      .join('\n');

    const prompt = `
You are an expert corporate recruiter and technical interviewer.
Analyze the candidate's transcript for this mock interview:
Interview Type: ${interview.type}
Topic: ${interview.topic}

Provide structured evaluation feedback and a final score (out of 100) based on their logic, technical depth, communication, and grammar.
Output the results in strict JSON format. Do not use markdown backtick blocks (like \`\`\`json) in your response, output ONLY the raw JSON string directly.

The JSON MUST match this structure exactly:
{
  "score": <number between 0 and 100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "generalTips": "<A summary advice paragraph outlining how to improve>"
}

--- INTERVIEW TRANSCRIPT ---
${transcriptText}
`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();

    // Remove markdown code blocks if AI wrapped the JSON
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    let evaluation;
    try {
      evaluation = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini evaluation JSON:', responseText);
      return res.status(500).json(errorResponse('AI returned invalid grading format. Please try again.'));
    }

    interview.status = 'completed';
    interview.feedback = {
      score: evaluation.score || 0,
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      generalTips: evaluation.generalTips || '',
    };

    await interview.save();

    res.status(200).json(successResponse(interview, 'Interview evaluated successfully.'));
  } catch (error) {
    console.error('Evaluate Interview Error:', error);
    res.status(500).json(errorResponse('Failed to evaluate interview.'));
  }
});

// @desc    Get user's past interviews
// @route   GET /api/interviews
// @access  Private
exports.getInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(successResponse(interviews, 'Interviews list fetched successfully.'));
});

// @desc    Get single interview details
// @route   GET /api/interviews/:id
// @access  Private
exports.getInterviewById = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
  if (!interview) {
    return res.status(404).json(errorResponse('Interview session not found.'));
  }
  res.status(200).json(successResponse(interview, 'Interview details fetched successfully.'));
});
