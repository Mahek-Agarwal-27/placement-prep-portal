const { GoogleGenerativeAI } = require('@google/generative-ai');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// @desc    Process prompt with Gemini AI
// @route   POST /api/ai/generate
// @access  Private
exports.generateAIResponse = asyncHandler(async (req, res) => {
  const { prompt, context, action } = req.body;
  console.log(`🤖 Received AI request: action=${action}, context length=${context ? context.length : 0}`);

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_key_here') {
    return res.status(503).json(errorResponse('Gemini API key is missing or invalid in server configuration.'));
  }

  if (!prompt && !context) {
    return res.status(400).json(errorResponse('Prompt or context is required.'));
  }

  let finalPrompt = '';

  switch (action) {
    case 'summarize':
      finalPrompt = `Summarize the following text clearly and concisely. Highlight the main points:\n\n${context}`;
      break;
    case 'explain':
      finalPrompt = `Explain the following concept simply as if to a student. Use examples if helpful:\n\n${context}`;
      break;
    case 'improve':
      finalPrompt = `Improve the grammar, tone, and clarity of the following text:\n\n${context}`;
      break;
    default:
      // Custom prompt
      finalPrompt = context ? `${prompt}\n\nContext:\n${context}` : prompt;
  }

  try {
    const result = await model.generateContent(finalPrompt);
    const responseText = result.response.text();
    res.status(200).json(successResponse({ text: responseText }, 'AI generated content successfully.'));
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json(errorResponse('Failed to generate AI response.'));
  }
});
