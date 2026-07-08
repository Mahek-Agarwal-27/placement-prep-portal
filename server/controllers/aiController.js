const { GoogleGenerativeAI } = require('@google/generative-ai');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

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
    // Generate AI content with a 15-second timeout and 1x retry on failure
    const generateWithTimeoutAndRetry = async (promptText) => {
      let attempt = 1;
      const maxAttempts = 2;
      const timeoutMs = 15000;
      
      while (attempt <= maxAttempts) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API timeout: Took longer than 15s to respond.')), timeoutMs)
          );
          
          console.log(`🤖 Note AI Attempt ${attempt}/${maxAttempts} running...`);
          const result = await Promise.race([
            model.generateContent(promptText),
            timeoutPromise
          ]);
          
          return result.response.text();
        } catch (err) {
          console.warn(`⚠️ Note AI Attempt ${attempt} failed:`, err.message);
          if (attempt === maxAttempts) {
            throw err;
          }
          attempt++;
          // Wait 1 second before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    };

    const responseText = await generateWithTimeoutAndRetry(finalPrompt);
    res.status(200).json(successResponse({ text: responseText }, 'AI generated content successfully.'));
  } catch (error) {
    console.error('Final Gemini API Error:', error);
    const errMsg = error.message || '';
    let clientMessage = 'Failed to generate AI response.';
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
