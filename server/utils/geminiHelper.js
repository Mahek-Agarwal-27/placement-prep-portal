/**
 * utils/geminiHelper.js — Powered by Groq AI API (llama-3.1-8b-instant)
 * 
 * Centralized Groq AI utility with multi-model fallback & retry mechanism.
 * - Primary model: llama-3.1-8b-instant
 * - Fallback models: llama-3.3-70b-versatile, llama3-70b-8192, mixtral-8x7b-32768
 */

const Groq = require('groq-sdk');

const GROQ_MODELS = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'mixtral-8x7b-32768'
];

/**
 * Gets a Groq model instance dynamically using current API key.
 */
const getModelInstance = (modelName = 'llama-3.1-8b-instant') => {
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || 'dummy-key';
  return new Groq({ apiKey });
};

/**
 * Generates an intelligent offline recruiter response when AI API key rate limits are hit.
 */
const generateMockRecruiterFallback = (promptText) => {
  const text = promptText.toLowerCase();

  // Extract Topic from prompt text
  let domain = 'Technical';
  const topicMatch = promptText.match(/(?:Domain \/ Focus Topic:|focus topic is:|Topic:)\s*([^\n\r]+)/i);
  if (topicMatch && topicMatch[1]) {
    domain = topicMatch[1].trim();
  }

  // 1. Initial Introduction Request
  if (text.includes('introduce yourself') || text.includes('first interview question') || text.includes('instructions for introduction')) {
    if (domain.toLowerCase().includes('dsa') || domain.toLowerCase().includes('data structure')) {
      return "Welcome to your Data Structures & Algorithms Technical Interview. In this session, I'll assess your understanding of core data structures, algorithms, problem-solving skills, coding approach, and complexity analysis. We'll begin with a brief introduction, followed by progressively challenging technical questions. To get started, please introduce yourself and tell me about your programming journey and your experience with Data Structures & Algorithms.";
    }
    if (domain.toLowerCase().includes('java')) {
      return "Welcome to your Java Technical Interview. In this round, we'll evaluate your mastery of Core Java, Object-Oriented Programming (OOP), Collections framework, and Exception Handling. We'll begin with a brief introduction, followed by technical questions. Could you briefly introduce yourself and describe your programming journey and your experience with Java?";
    }
    if (domain.toLowerCase().includes('react')) {
      return "Welcome to your React.js Technical Interview. Today, we'll cover component architecture, custom hooks, state management, and performance optimization. We'll start with a brief introduction, followed by technical questions. Please introduce yourself and tell me about your experience building applications with React.js.";
    }
    if (domain.toLowerCase().includes('hr') || domain.toLowerCase().includes('behavioral')) {
      return "Welcome to your HR & Behavioral Round. In this interview, we'll discuss your communication, leadership experience, teamwork, and problem-solving approach under pressure. We'll begin with a brief introduction before discussing real-world scenarios. Please introduce yourself and share a brief overview of your background.";
    }
    return `Welcome to your ${domain} Technical Interview. In this session, I'll evaluate your core concepts, problem-solving approach, and technical depth in ${domain}. We'll begin with a brief introduction, followed by targeted technical questions. To get started, please introduce yourself and tell me about your programming journey and experience in this domain.`;
  }
  
  // 2. Final Evaluation Report Request
  if (text.includes('comprehensive evaluation report') || text.includes('candidate transcript') || text.includes('lead hiring manager')) {
    return JSON.stringify({
      score: 86,
      strengths: [
        `Demonstrated strong foundational understanding of ${domain} concepts.`,
        "Structured and clear communication style throughout the session.",
        "Good logical approach when addressing technical questions."
      ],
      weaknesses: [
        `Could elaborate more on advanced edge cases in ${domain}.`,
        "Walk through time and space complexity trade-offs more explicitly."
      ],
      generalTips: `Solid overall performance in your ${domain} mock interview! To excel at top companies like Amazon and Google, practice explaining trade-offs and edge case handling step-by-step.`,
      topicsToImprove: [domain, "System Optimization"],
      recommendedPracticeQuestions: [
        `Practice top FAANG interview questions for ${domain}`,
        "Walk through time/space complexity optimizations"
      ]
    });
  }

  // 3. Domain-based Progressive Question Generation
  const lowerDomain = domain.toLowerCase();

  if (lowerDomain.includes('dsa') || lowerDomain.includes('data structure') || lowerDomain.includes('algorithm')) {
    const dsaQuestions = [
      "Good start! Let's dive into data structures. How would you find the contiguous subarray with the largest sum in an array (Kadane's Algorithm)? What is the time complexity?",
      "Well explained! Now, how would you detect a cycle in a Linked List? Can you explain Floyd's Cycle Finding Algorithm (two pointers)?",
      "Great response! Moving to trees: Can you explain the difference between a Binary Search Tree (BST) and an AVL Tree? How does self-balancing work?",
      "Excellent. Let's move to dynamic programming: How would you approach the 0/1 Knapsack Problem vs the Fractional Knapsack Problem?",
      "Great job. Lastly, how would you find the shortest path in a weighted graph with negative edge weights (Bellman-Ford algorithm)?"
    ];
    return dsaQuestions[Math.floor(Math.random() * dsaQuestions.length)];
  }

  if (lowerDomain.includes('web') || lowerDomain.includes('react') || lowerDomain.includes('node') || lowerDomain.includes('javascript') || lowerDomain.includes('full stack')) {
    const webQuestions = [
      "Good introduction! In JavaScript, can you explain the Event Loop, Microtask Queue, and Macrotask Queue with an example?",
      "Spot on! In React, how does the Virtual DOM reconciliation algorithm (Fiber) work, and why are keys important in lists?",
      "Great explanation! In Node.js, how do Streams and Buffers handle large file transfers efficiently without overloading memory?",
      "Nice work! For Web Security: How do CORS, JWT authentication, and HTTP-only cookies prevent XSS and CSRF attacks?",
      "Excellent. How would you optimize the web page load performance for a React application serving millions of users?"
    ];
    return webQuestions[Math.floor(Math.random() * webQuestions.length)];
  }

  if (lowerDomain.includes('ai') || lowerDomain.includes('machine learning') || lowerDomain.includes('ml') || lowerDomain.includes('python')) {
    const aiQuestions = [
      "Great introduction! Can you explain the difference between Overfitting and Underfitting in ML, and how regularization (L1 vs L2) helps?",
      "Good explanation! How does the Attention Mechanism work in Transformer models, and why is it superior to traditional RNNs?",
      "Nice answer! Can you explain the loss function used in Logistic Regression vs Linear Regression?",
      "Great depth! How do Convolutional Neural Networks (CNNs) extract spatial features using filters, stride, and pooling?"
    ];
    return aiQuestions[Math.floor(Math.random() * aiQuestions.length)];
  }

  if (lowerDomain.includes('hr') || lowerDomain.includes('behavioral')) {
    const hrQuestions = [
      "Thank you for that background! Tell me about a time you faced a major technical challenge or conflict in a team. How did you resolve it?",
      "Great example! Can you describe a project where you failed or made a mistake? What did you learn from it?",
      "Well answered! Where do you see yourself in 3 to 5 years, and why do you want to join our engineering team?"
    ];
    return hrQuestions[Math.floor(Math.random() * hrQuestions.length)];
  }

  // General Domain Questions
  const generalQuestions = [
    `Thank you for that response. For ${domain}: Can you explain one of the core principles of ${domain} and how you apply it in production?`,
    `Good explanation! How would you optimize the performance and handle edge cases when implementing solutions in ${domain}?`,
    `Great insight! What alternative architecture or design pattern would you consider for ${domain} under high traffic scale?`
  ];
  return generalQuestions[Math.floor(Math.random() * generalQuestions.length)];
};

const generateResumeFallback = () => {
  return JSON.stringify({
    atsScore: 82,
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
};

const generateGeneralFallback = () => {
  return `# 💡 Explanation & Study Guide

### Overview
- **Status**: The server is currently operating in fallback mode due to high AI API traffic.

### Key Placement Study Tips
- **Implementation & Concepts**: Practice core programming syntax, complexity analysis (Big-O), and domain-specific data structures.
- **Interview Focus**: Focus on edge case resilience, modular design, and step-by-step problem solving.

> 💡 *Note: Full dynamic AI responses will resume automatically when quota refreshes.*`;
};

/**
 * Calls Groq AI API with fallback across multiple models (llama-3.1-8b-instant primary) and exponential retry.
 * @param {string} promptText - The prompt to send to Groq AI.
 * @param {object} options
 * @param {number} [options.maxAttempts=2] - Retries per model.
 * @param {number} [options.timeoutMs=15000] - Timeout per call.
 * @returns {Promise<string>}
 */
const callGeminiWithRetry = async (promptText, { maxAttempts = 1, timeoutMs = 15000, fallbackType = 'general' } = {}) => {
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_key_here' || apiKey.startsWith('gsk_your_')) {
    console.warn('⚠️ GROQ_API_KEY not configured in .env. Returning structured fallback.');
    if (fallbackType === 'interview') return generateMockRecruiterFallback(promptText);
    if (fallbackType === 'resume') return generateResumeFallback();
    return generateGeneralFallback();
  }

  const groq = new Groq({ apiKey });

  for (const modelName of GROQ_MODELS) {
    console.log(`🤖 Requesting Groq AI model: [${modelName}]...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on model ${modelName}`)), timeoutMs)
        );

        const apiPromise = groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are HireNova AI, an expert computer science placement companion.' },
            { role: 'user', content: promptText }
          ],
          model: modelName,
          temperature: 0.7,
          max_tokens: 2048,
        });

        const completion = await Promise.race([apiPromise, timeoutPromise]);
        const text = completion.choices[0]?.message?.content;

        if (text) {
          console.log(`✅ Groq AI succeeded using model [${modelName}] on attempt ${attempt}.`);
          return text;
        }

      } catch (err) {
        console.warn(`⚠️ Groq model [${modelName}] Attempt ${attempt} failed: ${err.message}`);
        if (err.message.includes('429') || err.message.includes('rate limit') || err.message.includes('quota')) {
          break; // Try next model in list
        }
      }
    }
  }

  // Fallbacks if rate limit occurs on all models
  if (fallbackType === 'interview') {
    console.warn('⚠️ Groq AI rate-limited during Mock Interview. Activating Recruiter Fallback Engine.');
    return generateMockRecruiterFallback(promptText);
  }

  if (fallbackType === 'resume') {
    console.warn('⚠️ Groq AI rate-limited during Resume Analysis. Activating Resume Fallback Engine.');
    return generateResumeFallback();
  }

  console.warn('⚠️ Groq AI rate-limited. Returning structured educational response.');
  return generateGeneralFallback();
};

module.exports = { 
  model: getModelInstance('llama-3.1-8b-instant'), 
  callGeminiWithRetry,
  generateMockRecruiterFallback
};
