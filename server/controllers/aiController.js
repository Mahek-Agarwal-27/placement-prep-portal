/**
 * controllers/aiController.js
 * 
 * Handles AI-related endpoints: Note AI generation and global chat assistant.
 * Uses shared geminiHelper for model access and retry logic.
 */

const asyncHandler = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { callGeminiWithRetry } = require('../utils/geminiHelper');

// @desc    Process prompt with Gemini AI (Notes AI)
// @route   POST /api/ai/generate
// @access  Private
exports.generateAIResponse = asyncHandler(async (req, res) => {
  const { prompt, context, action } = req.body;
  console.log(`🤖 Notes AI request: action=${action}, context length=${context ? context.length : 0}`);

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
      finalPrompt = context ? `${prompt}\n\nContext:\n${context}` : prompt;
  }

  try {
    const responseText = await callGeminiWithRetry(finalPrompt, { maxAttempts: 3, timeoutMs: 15000 });
    
    // Asynchronously save to AIHistory & Activity timeline (non-blocking)
    const AIHistory = require('../models/AIHistory');
    const Activity = require('../models/Activity');
    const isRoadmap = action === 'roadmap' || (prompt && prompt.toLowerCase().includes('roadmap'));
    
    Promise.all([
      AIHistory.create({
        user: req.user.id,
        category: isRoadmap ? 'roadmap' : 'note',
        title: isRoadmap ? `AI Roadmap: ${prompt || 'Custom Plan'}` : `AI Notes (${action || 'Generate'})`,
        content: responseText,
        duration: isRoadmap ? '90 Days' : '',
      }),
      Activity.create({
        user: req.user.id,
        type: 'ai',
        title: isRoadmap ? 'Generated AI Roadmap' : 'Generated AI Study Notes',
        description: `Action: ${action || 'General AI prompt'}`,
      })
    ]).catch(err => console.error('Auto-log error in Notes AI:', err.message));

    res.status(200).json(successResponse({ text: responseText }, 'AI generated content successfully.'));
  } catch (error) {
    console.error('Notes AI Final Error:', error.message);
    res.status(503).json(errorResponse(error.message));
  }
});

// @desc    Global Chat AI for the floating assistant
// @route   POST /api/ai/chat
// @access  Private
exports.chatAIResponse = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_key_here') {
    return res.status(503).json(errorResponse('Gemini API key is missing.'));
  }
  if (!message) {
    return res.status(400).json(errorResponse('Message is required.'));
  }

  let conversationContext = "You are HireNova AI, a helpful, encouraging, and expert placement companion. You help computer science students prepare for technical interviews, DSA, and resume building. Keep your answers concise, structured (use bullet points if needed), and friendly.\n\n";

  if (history && history.length > 0) {
    conversationContext += "Recent conversation history:\n";
    history.slice(-5).forEach(msg => {
      conversationContext += `${msg.sender === 'user' ? 'Student' : 'HireNova AI'}: ${msg.text}\n`;
    });
    conversationContext += "\n";
  }

  const finalPrompt = `${conversationContext}Student: ${message}\nHireNova AI:`;

  try {
    const responseText = await callGeminiWithRetry(finalPrompt, { maxAttempts: 3, timeoutMs: 15000 });

    // Asynchronously save to AIHistory & Activity timeline (non-blocking)
    const AIHistory = require('../models/AIHistory');
    const Activity = require('../models/Activity');

    Promise.all([
      AIHistory.create({
        user: req.user.id,
        category: 'chat',
        title: `Chat Question: "${message.substring(0, 40)}${message.length > 40 ? '...' : ''}"`,
        content: `Student: ${message}\n\nHireNova AI: ${responseText}`,
      }),
      Activity.create({
        user: req.user.id,
        type: 'assistant',
        title: 'Used AI Assistant',
        description: `Asked: ${message.substring(0, 50)}`,
      })
    ]).catch(err => console.error('Auto-log error in Chat AI:', err.message));

    res.status(200).json(successResponse({ text: responseText }, 'Chat response generated.'));
  } catch (error) {
    console.error('Chat AI Final Error:', error.message);
    res.status(503).json(errorResponse(error.message));
  }
});
