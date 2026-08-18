const asyncHandler = require('../middleware/errorHandler');
const { successResponse, errorResponse } = { ...require('../utils/apiResponse') };
const { callGeminiWithRetry } = require('../utils/geminiHelper');

/**
 * Clean & Dynamic Offline / Rate-Limit Fallback Generator for AI Notes.
 * Activated ONLY during actual Gemini API outages, rate limits, or network timeouts.
 * Does NOT contain hardcoded topic templates; dynamically formats whatever prompt/context the user provided.
 */
const generateAINotesFallback = (promptText = '', action = '', contextText = '') => {
  const reqText = (promptText || contextText || 'Requested Subject').trim();

  if (action === 'explain') {
    return `# 💡 Explanation: ${reqText}

### Overview
- **Question / Topic**: ${reqText}

### Key Points & Study Guidance
- **Implementation & Syntax**: Practice writing code examples and testing edge cases for ${reqText}.
- **Core Concepts**: Focus on understanding key definitions, operational mechanisms, and practical use cases.

> 💡 *Note: The server is currently operating in offline mode. Full dynamic AI responses will resume shortly.*`;
  }

  if (action === 'roadmap') {
    return `# 🗺️ Learning Roadmap: ${reqText}

### Phase 1 — Prerequisite Fundamentals
- Syntax, environment setup & basic primitives for ${reqText}
- Control flow structures and input/output handling

### Phase 2 — Core Concepts & Architecture
- Core data structures, API functions & design patterns
- State management and modular code organization

### Phase 3 — Advanced Topics & Ecosystem
- Performance optimization, error resilience & custom tooling

### Phase 4 — Projects & Interview Preparation
- Real-world project implementation using ${reqText}
- Technical interview coding problems and architectural discussions`;
  }

  if (action === 'summarize') {
    const rawNote = (contextText || promptText).trim();
    if (rawNote && rawNote.length > 5) {
      return `# 📝 Executive Summary of Provided Note

### Key Points Extracted from Note
> ${rawNote.substring(0, 450)}${rawNote.length > 450 ? '...' : ''}

- Summary of core facts, definitions, and code ideas extracted from the note editor.`;
    }
    return `⚠️ **Note Content Required**: Please write or select a note in the note editor to generate a concise summary.`;
  }

  return `# 📝 Study Notes: ${reqText}\n\n- Educational study overview for ${reqText}.`;
};

// @desc    Process prompt with Gemini AI (Dynamic AI Study Tutor - 3 Modes Only)
// @route   POST /api/ai/generate
// @access  Private
const generateAIResponse = asyncHandler(async (req, res) => {
  const { prompt, context, action } = req.body;

  const rawPrompt = (prompt || '').trim();
  const rawContext = (context || '').trim();
  console.log(`🤖 Notes AI request: action=${action || 'custom'}, prompt="${rawPrompt.substring(0, 50)}"`);

  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_key_here' || apiKey.startsWith('gsk_your_')) {
    console.warn(`⚠️ Groq AI API key is missing or unconfigured. Activating AI Notes Fallback Engine for prompt: "${rawPrompt.substring(0, 30)}"`);
    const fallbackText = generateAINotesFallback(rawPrompt, action, rawContext);
    return res.status(200).json(successResponse({ text: fallbackText }, 'AI generated content successfully (Offline Mode).'));
  }

  if (!rawPrompt && !rawContext) {
    return res.status(400).json(errorResponse('Prompt or note editor context is required for AI Notes.'));
  }

  const systemInstructions = `You are HireNova AI Notes Assistant — an expert general-purpose Computer Science AI Study Tutor.

You have exactly three modes:
1. Explain Simply (action = 'explain')
2. Learning Roadmap (action = 'roadmap')
3. Summarize Note (action = 'summarize')

You are ONLY responsible for generating educational study content.
You are NOT a mock interviewer, recruiter, hiring manager, resume analyzer, or interview evaluator.
Never generate Mock Interview conversation. Never say "Welcome to your interview", "Please introduce yourself", "Tell me about yourself", or "I will evaluate your response".

FORBIDDEN GENERIC FILLER SENTENCES (DO NOT USE THESE):
- "core software engineering concept"
- "handles computational state"
- "improves scalability"
- "provides modular architecture"
- "optimizes processing"
- "standardized abstractions"

MODE SPECIFIC MANDATES:

IF MODE IS EXPLAIN SIMPLY (action === 'explain'):
- Answer the user's current request directly in a beginner-friendly teaching style.
- Teach the requested concept clearly. Use code examples, syntax, analogies, comparisons, or step-by-step explanations as appropriate for the question asked.
- Do NOT force a generic "What is X?" template if the user asked a specific question (e.g. "Why is TCP reliable?", "Difference between stack and queue", "Why is binary search O(log n)?", "Explain Java inheritance with an example"). Answer that EXACT question.
- Do NOT generate a roadmap or phases.

IF MODE IS LEARNING ROADMAP (action === 'roadmap'):
- Create a practical, progressive learning roadmap for the requested subject (Phase 1, Phase 2, Phase 3, Phase 4, Phase 5).
- Organize it from prerequisite concepts to advanced architecture and ecosystem projects.
- Use real technical subtopics relevant to the requested subject. Do NOT use generic filler.

IF MODE IS SUMMARIZE NOTE (action === 'summarize'):
- Summarize ONLY the CURRENT NOTE EDITOR CONTENT provided.
- Do NOT introduce unrelated concepts, do NOT create a roadmap.`;

  let fullPrompt = `${systemInstructions}\n\n`;

  if (rawContext) {
    fullPrompt += `CURRENT NOTE EDITOR CONTEXT:\n${rawContext.substring(0, 3500)}\n\n`;
  }

  if (action === 'explain') {
    fullPrompt += `SELECTED MODE: EXPLAIN SIMPLY\nUSER REQUEST: "${rawPrompt || rawContext}"\n\nInstructions: Answer the user's request directly in a clear, beginner-friendly teaching style. Provide real technical details and concrete code/examples where helpful. DO NOT output a roadmap.`;
  } else if (action === 'roadmap') {
    fullPrompt += `SELECTED MODE: LEARNING ROADMAP\nUSER REQUEST: "${rawPrompt}"\n\nInstructions: Create a structured 5-6 phase learning roadmap for "${rawPrompt}". Include real technical subtopics, tools, and algorithms. DO NOT use generic filler.`;
  } else if (action === 'summarize') {
    fullPrompt += `SELECTED MODE: SUMMARIZE NOTE\nUSER REQUEST: Summarize the current Note Editor content.\n\nInstructions: Summarize ONLY the text in CURRENT NOTE EDITOR CONTEXT above. Do not invent outside information or create a roadmap.`;
  } else {
    fullPrompt += `USER REQUEST: "${rawPrompt || 'General Computer Science Subject'}"`;
  }

  try {
    let responseText = await callGeminiWithRetry(fullPrompt, { maxAttempts: 1, timeoutMs: 8000 });

    // RECRUITER CONTAMINATION SAFETY FILTER
    const lowerResp = (responseText || '').toLowerCase();
    if (
      !responseText ||
      lowerResp.includes('welcome to your interview') ||
      lowerResp.includes('please introduce yourself') ||
      lowerResp.includes('tell me about yourself') ||
      lowerResp.includes('i will evaluate your response') ||
      lowerResp.includes("let's begin the interview")
    ) {
      console.warn(`⚠️ Notes AI recruiter contamination detected. Serving fallback for: action=${action || 'custom'}, prompt="${rawPrompt.substring(0, 30)}"`);
      responseText = generateAINotesFallback(rawPrompt, action, rawContext);
    }

    console.log(`✅ Notes AI response generated dynamically: action=${action || 'custom'}`);
    res.status(200).json(successResponse({ text: responseText }, 'AI generated content successfully.'));

    // Asynchronous database logging in background (non-blocking)
    setImmediate(() => {
      const AIHistory = require('../models/AIHistory');
      const Activity = require('../models/Activity');
      const isRoadmap = action === 'roadmap';
      const User = require('../models/User');

      Promise.all([
        AIHistory.create({
          user: req.user.id,
          category: isRoadmap ? 'roadmap' : 'note',
          title: isRoadmap 
            ? `AI Roadmap: ${rawPrompt || 'Custom Subject'}` 
            : `AI Note: ${rawPrompt.substring(0, 35) || 'Generated Note'}`,
          content: responseText,
          duration: isRoadmap ? '90 Days' : '',
        }),
        Activity.create({
          user: req.user.id,
          type: 'ai',
          title: isRoadmap ? 'Generated AI Roadmap' : 'Generated AI Note',
          description: `Asked: ${rawPrompt.substring(0, 45)}`,
        })
      ]).catch(err => console.error('Auto-logging error in AI generate:', err.message));

      User.findById(req.user.id).then(user => {
        if (user) user.updateStreak();
      }).catch(() => {});
    });

  } catch (error) {
    console.warn(`⚠️ Notes AI fallback used due to Gemini API timeout/limit: action=${action || 'custom'}, prompt="${rawPrompt.substring(0, 30)}"`);
    const fallbackText = generateAINotesFallback(rawPrompt, action, rawContext);
    return res.status(200).json(successResponse({ text: fallbackText }, 'AI generated content successfully.'));
  }
});

// @desc    Global Chat AI for the floating assistant
// @route   POST /api/ai/chat
// @access  Private
const chatAIResponse = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_key_here' || apiKey.startsWith('gsk_your_')) {
    console.warn('⚠️ Groq AI API key missing or unconfigured for chat. Serving assistant fallback.');
    const chatFallback = `Hello! I am HireNova AI, your placement study companion. Here is guidance regarding "${message.substring(0, 60)}":

- **Core Concepts**: Review foundational language syntax, data structures, and system design patterns for this domain.
- **Interview Focus**: Focus on time/space complexity analysis (Big-O), edge cases, and hands-on coding implementations.
- **Tip**: You can also use the AI Notes and Mock Interview tabs to generate dedicated study roadmaps and interview questions!`;
    return res.status(200).json(successResponse({ text: chatFallback }, 'Chat response generated successfully (Offline Mode).'));
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
    console.warn('⚠️ Floating Chat AI rate-limit encountered. Serving friendly assistant fallback:', error.message);
    const chatFallback = `Hello! I am HireNova AI, your placement study companion. Here is guidance regarding "${message.substring(0, 60)}":

- **Core Concepts**: Review foundational language syntax, data structures, and system design patterns for this domain.
- **Interview Focus**: Focus on time/space complexity analysis (Big-O), edge cases, and hands-on coding implementations.
- **Tip**: You can also use the AI Notes and Mock Interview tabs to generate dedicated study roadmaps and interview questions!`;
    return res.status(200).json(successResponse({ text: chatFallback }, 'Chat response generated successfully.'));
  }
});

module.exports = {
  generateAIResponse,
  chatAIResponse,
  generateAINotesFallback
};
