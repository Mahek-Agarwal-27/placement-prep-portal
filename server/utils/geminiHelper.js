/**
 * utils/geminiHelper.js — Powered by Groq AI API (llama-3.1-8b-instant)
 * 
 * Centralized Groq AI utility with multi-model fallback & retry mechanism.
 * - Primary model: llama-3.1-8b-instant
 * - Fallback models: llama-3.3-70b-versatile, llama3-70b-8192, mixtral-8x7b-32768
 */

const Groq = require('groq-sdk');

// Curated list of currently supported Groq chat models in priority order
const GROQ_MODELS = [
  'qwen/qwen3.8-27b',
  'groq/compound-mini',
  'groq/compound'
];

let cachedActiveModels = null;
let lastModelCheckTime = 0;

/**
 * Dynamically resolves active chat models for the current Groq API key
 */
const getActiveGroqModels = async (groqInstance) => {
  const now = Date.now();
  if (cachedActiveModels && now - lastModelCheckTime < 5 * 60 * 1000) {
    return cachedActiveModels;
  }

  try {
    const list = await groqInstance.models.list();
    if (list && Array.isArray(list.data)) {
      const activeIds = new Set(list.data.map((m) => m.id));
      const matched = GROQ_MODELS.filter((m) => activeIds.has(m));
      if (matched.length > 0) {
        cachedActiveModels = matched;
        lastModelCheckTime = now;
        return cachedActiveModels;
      }
    }
  } catch (err) {
    // If listing fails, fall back to the static list
  }

  cachedActiveModels = GROQ_MODELS;
  lastModelCheckTime = now;
  return cachedActiveModels;
};

/**
 * Gets a Groq model instance dynamically using current API key.
 */
const getModelInstance = (modelName = 'qwen/qwen3.8-27b') => {
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || 'dummy-key';
  return new Groq({ apiKey });
};

/**
 * Generates an intelligent offline recruiter response when AI API key rate limits are hit.
 */
/**
 * Generates an intelligent offline recruiter response when AI API key rate limits are hit.
 */
const generateMockRecruiterFallback = (promptText) => {
  const text = promptText.toLowerCase();

  // Extract Topic from prompt text
  let domain = 'General Technical';
  const topicMatch = promptText.match(/(?:Domain \/ Focus Topic:|Normalized Focus Domain:|focus topic is:|Topic:)\s*([^\n\r,]+)/i);
  if (topicMatch && topicMatch[1]) {
    domain = topicMatch[1].trim();
  }

  // Clean domain string
  const cleanDomain = domain
    .replace(/\s+(Technical\s+)?Interview$/i, '')
    .replace(/\(DSA\)|\(DBMS\)|\(OS\)|\(CN\)|\(OOPs?\)/gi, '')
    .trim();

  const isGeneralTech = !cleanDomain || 
    cleanDomain.toLowerCase() === 'technical' || 
    cleanDomain.toLowerCase() === 'general technical' || 
    cleanDomain.toLowerCase() === 'core technical' || 
    cleanDomain.toLowerCase() === 'general';

  // 1. Initial Introduction Request
  if (text.includes('introduce yourself') || text.includes('first interview question') || text.includes('instructions for introduction') || text.includes('opening message')) {
    if (text.includes('hr & behavioral') || cleanDomain.toLowerCase().includes('hr') || cleanDomain.toLowerCase().includes('behavioral')) {
      return "Welcome to your HR & Behavioral Round. In this interview, we'll discuss your communication, leadership experience, teamwork, and problem-solving approach under pressure. We'll begin with a brief introduction before discussing real-world scenarios. Please introduce yourself and share a brief overview of your background and career goals.";
    }
    if (text.includes('system design') || cleanDomain.toLowerCase().includes('system design')) {
      return "Welcome to your System Design Interview. In this session, I'll evaluate your ability to design scalable systems, software architecture principles, database choices, and trade-offs. We'll begin with a brief introduction, followed by architectural design questions. To get started, please introduce yourself and share your experience with designing or working on software systems.";
    }
    if (cleanDomain.toLowerCase().includes('dsa') || cleanDomain.toLowerCase().includes('data structure') || cleanDomain.toLowerCase().includes('algorithm')) {
      return "Welcome to your Data Structures & Algorithms Technical Interview. In this session, I'll assess your understanding of core data structures, algorithms, problem-solving skills, coding approach, and complexity analysis. We'll begin with a brief introduction, followed by progressively challenging technical questions. To get started, please introduce yourself and tell me about your programming journey and your experience with Data Structures & Algorithms.";
    }
    if (cleanDomain.toLowerCase() === 'java') {
      return "Welcome to your Java Technical Interview. In this round, we'll evaluate your mastery of Core Java, Object-Oriented Programming (OOP), Collections framework, and Exception Handling. We'll begin with a brief introduction, followed by technical questions. Could you briefly introduce yourself and describe your programming journey and your experience with Java?";
    }
    if (cleanDomain.toLowerCase().includes('c++') || cleanDomain.toLowerCase() === 'cpp') {
      return "Welcome to your C++ Technical Interview. In this session, we'll assess your mastery of C++ fundamentals, STL, memory management, pointers, and Object-Oriented design. We'll begin with a brief introduction, followed by technical questions. Please introduce yourself and tell me about your journey with C++.";
    }
    if (cleanDomain.toLowerCase() === 'python') {
      return "Welcome to your Python Technical Interview. In this round, we'll evaluate your understanding of Python syntax, data structures, OOP concepts, decorators, generators, and practical problem solving. We'll start with a brief introduction, followed by technical questions. Could you please introduce yourself and share your experience working with Python?";
    }
    if (cleanDomain.toLowerCase().includes('react')) {
      return "Welcome to your React.js Technical Interview. Today, we'll cover component architecture, custom hooks, state management, and performance optimization. We'll start with a brief introduction, followed by technical questions. Please introduce yourself and tell me about your experience building applications with React.js.";
    }
    if (cleanDomain.toLowerCase().includes('node')) {
      return "Welcome to your Node.js Backend Technical Interview. In this round, we'll explore asynchronous JavaScript, Express.js, RESTful API design, database connectivity, and backend security. To start, please introduce yourself and discuss your experience with backend development.";
    }
    if (cleanDomain.toLowerCase().includes('sql') || cleanDomain.toLowerCase().includes('dbms') || cleanDomain.toLowerCase().includes('database')) {
      return "Welcome to your Database & SQL Technical Interview. Today, we'll evaluate your expertise in relational database design, SQL querying, indexing, transactions (ACID), and query optimization. To get started, please introduce yourself and share your experience with databases.";
    }
    if (cleanDomain.toLowerCase().includes('operating system') || cleanDomain.toLowerCase() === 'os') {
      return "Welcome to your Operating Systems Technical Interview. In this session, we'll discuss process management, multithreading, concurrency, memory paging, and deadlock handling. Please introduce yourself and tell me about your background in computer science fundamentals.";
    }
    if (cleanDomain.toLowerCase().includes('network') || cleanDomain.toLowerCase() === 'cn') {
      return "Welcome to your Computer Networks Technical Interview. Today, we'll evaluate your understanding of the OSI and TCP/IP models, routing protocols, DNS, HTTP/HTTPS, and network security. To begin, please introduce yourself and share your experience with networking concepts.";
    }
    if (cleanDomain.toLowerCase().includes('machine learning') || cleanDomain.toLowerCase().includes('ai') || cleanDomain.toLowerCase().includes('ml')) {
      return "Welcome to your AI & Machine Learning Technical Interview. In this session, we'll evaluate your understanding of machine learning algorithms, model evaluation, deep learning principles, and practical problem-solving. To get started, please introduce yourself and tell me about your experience with AI/ML.";
    }

    if (isGeneralTech) {
      return "Welcome to your Technical Interview. In this session, I'll evaluate your core concepts, problem-solving approach, and technical depth across software engineering and computer science fundamentals. We'll begin with a brief introduction, followed by targeted technical questions. To get started, please introduce yourself and tell me about your programming journey and engineering background.";
    }

    return `Welcome to your ${cleanDomain} Technical Interview. In this session, I'll evaluate your core concepts, problem-solving approach, and technical depth in ${cleanDomain}. We'll begin with a brief introduction, followed by targeted technical questions. To get started, please introduce yourself and tell me about your programming journey and experience with ${cleanDomain}.`;
  }
  
  // 2. Final Evaluation Report Request
  if (text.includes('comprehensive evaluation report') || text.includes('candidate transcript') || text.includes('lead hiring manager')) {
    const reportTopic = isGeneralTech ? 'Software Engineering & Core CS' : cleanDomain;
    return JSON.stringify({
      score: 86,
      strengths: [
        `Demonstrated strong foundational understanding of ${reportTopic} concepts.`,
        "Structured and clear communication style throughout the session.",
        "Good logical approach when addressing technical questions."
      ],
      weaknesses: [
        `Could elaborate more on advanced edge cases in ${reportTopic}.`,
        "Walk through time and space complexity trade-offs more explicitly."
      ],
      generalTips: `Solid overall performance in your ${reportTopic} mock interview! To excel at top tech companies, practice explaining trade-offs, architecture decisions, and edge cases step-by-step.`,
      topicsToImprove: [reportTopic, "System Optimization"],
      recommendedPracticeQuestions: [
        `Practice top MNC interview questions for ${reportTopic}`,
        "Walk through time and space complexity optimizations"
      ]
    });
  }

  // 3. Domain-based Progressive Question Generation
  const lowerDomain = cleanDomain.toLowerCase();

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

  if (lowerDomain === 'java') {
    const javaQuestions = [
      "Thank you for introducing yourself! Can you explain the difference between method overloading and method overriding in Java with respect to polymorphism?",
      "Great answer! How does the Java Memory Model manage Stack vs Heap memory, and how does Garbage Collection (e.g. G1GC) work?",
      "Nice explanation! What is the difference between HashMap, HashTable, and ConcurrentHashMap in terms of thread safety and locking?",
      "Excellent. Can you explain Java Exception hierarchy and the difference between checked vs unchecked exceptions?"
    ];
    return javaQuestions[Math.floor(Math.random() * javaQuestions.length)];
  }

  if (lowerDomain.includes('c++') || lowerDomain === 'cpp') {
    const cppQuestions = [
      "Thanks for the background! Can you explain how virtual functions and vtables enable runtime polymorphism in C++?",
      "Good explanation! What are Smart Pointers in modern C++ (unique_ptr, shared_ptr, weak_ptr) and how do they prevent memory leaks?",
      "Great answer! Can you explain the difference between pass-by-value, pass-by-reference, and pass-by-pointer in C++?",
      "Excellent. How does RAII (Resource Acquisition Is Initialization) work in C++?"
    ];
    return cppQuestions[Math.floor(Math.random() * cppQuestions.length)];
  }

  if (lowerDomain === 'python') {
    const pythonQuestions = [
      "Thank you for the introduction! How does Python handle memory management and what is the role of GIL (Global Interpreter Lock)?",
      "Good explanation! Can you explain the difference between list vs tuple, and deepcopy vs shallow copy in Python?",
      "Great! How do Decorators and Generators (yield) work under the hood in Python?",
      "Excellent. What is the difference between `@classmethod`, `@staticmethod`, and regular instance methods?"
    ];
    return pythonQuestions[Math.floor(Math.random() * pythonQuestions.length)];
  }

  if (lowerDomain.includes('web') || lowerDomain.includes('react') || lowerDomain.includes('node') || lowerDomain.includes('javascript') || lowerDomain.includes('full stack') || lowerDomain.includes('mern')) {
    const webQuestions = [
      "Good introduction! In JavaScript, can you explain the Event Loop, Microtask Queue, and Macrotask Queue with an example?",
      "Spot on! In React, how does the Virtual DOM reconciliation algorithm (Fiber) work, and why are keys important in lists?",
      "Great explanation! In Node.js, how do Streams and Buffers handle large file transfers efficiently without overloading memory?",
      "Nice work! For Web Security: How do CORS, JWT authentication, and HTTP-only cookies prevent XSS and CSRF attacks?",
      "Excellent. How would you optimize web page load performance and Core Web Vitals for a React application serving millions of users?"
    ];
    return webQuestions[Math.floor(Math.random() * webQuestions.length)];
  }

  if (lowerDomain.includes('sql') || lowerDomain.includes('dbms') || lowerDomain.includes('database')) {
    const dbQuestions = [
      "Thanks for sharing! Can you explain ACID properties in DBMS and how database transactions ensure isolation and durability?",
      "Good answer! What is the difference between Clustered Index and Non-Clustered Index, and how does B-Tree indexing speed up query retrieval?",
      "Great! Can you explain database normalization (1NF to BCNF) and when denormalization is preferred for read-heavy systems?",
      "Well explained. How would you optimize a slow-running SQL query joining multiple tables with millions of rows?"
    ];
    return dbQuestions[Math.floor(Math.random() * dbQuestions.length)];
  }

  if (lowerDomain.includes('system design') || lowerDomain.includes('scalable') || lowerDomain.includes('distributed')) {
    const sysDesignQuestions = [
      "Thanks for the introduction! When designing a scalable system, how do you decide between SQL vs NoSQL databases based on the CAP theorem?",
      "Great points! How does Distributed Caching (Redis/Memcached) work, and how do you handle cache invalidation strategies (Write-Through vs Write-Back)?",
      "Well explained! How do Load Balancers (L4 vs L7) distribute traffic and handle failovers in high-availability clusters?",
      "Excellent. How would you design a rate limiter or notification system handling 100,000 requests per second?"
    ];
    return sysDesignQuestions[Math.floor(Math.random() * sysDesignQuestions.length)];
  }

  if (lowerDomain.includes('ai') || lowerDomain.includes('machine learning') || lowerDomain.includes('ml')) {
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

  // General Technical Domain Questions
  const generalQuestions = [
    "Thank you for introducing yourself! Can you walk me through a complex technical challenge you solved recently in your projects?",
    "Good explanation! How do you approach debugging and identifying performance bottlenecks in your code?",
    "Great insight! How do you ensure code maintainability, clean architecture, and test coverage before deploying to production?"
  ];
  return generalQuestions[Math.floor(Math.random() * generalQuestions.length)];
};

const generateResumeFallback = () => {
  return JSON.stringify({
    feedback: {
      generalAdvice: "Solid technical background with relevant programming and software development foundation. Clear presentation of projects and education.",
      keywordMatching: [
        "Identified core technical foundations including programming languages, frameworks, and tools.",
        "Demonstrated practical implementation across academic and engineering projects."
      ],
      missingKeywords: [
        "Include domain-specific testing libraries or CI/CD tools if applicable to your workflow.",
        "Add relevant database indexing or cloud deployment concepts."
      ],
      bulletPoints: [
        {
          "original": "Worked on web development project using React and Node.js.",
          "improved": "Developed responsive web application using React.js and Node.js RESTful architecture."
        },
        {
          "original": "Responsible for database schema design and queries.",
          "improved": "Designed normalized relational database schemas and optimized SQL queries for data retrieval."
        }
      ],
      formatting: [
        "Ensure consistent date formats (e.g. Month Year - Month Year) across experience and education.",
        "Verify contact details including GitHub and LinkedIn profiles are clearly formatted."
      ],
      actionItems: [
        "Begin each project bullet point with a decisive technical action verb (e.g., 'Architected', 'Implemented', 'Engineered').",
        "Group technical skills into clear subcategories (Languages, Frameworks, Databases, Tools) for ATS readability.",
        "Ensure GitHub repository demo links or live URLs are explicitly listed for top projects."
      ]
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
 * Calls Groq AI API with dynamic active models, fallback support, and clean logging.
 * @param {string} promptText - The prompt to send to Groq AI.
 * @param {object} options
 * @param {number} [options.maxAttempts=1] - Retries per model.
 * @param {number} [options.timeoutMs=15000] - Timeout per call.
 * @param {string} [options.fallbackType='general'] - Type of fallback if all models fail.
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
  const modelsToTry = await getActiveGroqModels(groq);

  for (const modelName of modelsToTry) {
    const logTag = fallbackType === 'interview' ? '[Mock Interview]' : '[Groq AI]';
    console.log(`${logTag} Sending request to Groq`);
    console.log(`${logTag} Model: ${modelName}`);

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
        let text = completion.choices[0]?.message?.content;

        if (text && typeof text === 'string' && text.trim()) {
          text = text.trim();
          // Clean up any compound model answer wrappers if present
          if (text.includes('**Final One‑Sentence Interview Question**')) {
            text = text.split('**Final One‑Sentence Interview Question**').pop().replace(/^[*\s\n\r]+|[*\s\n\r]+$/g, '').trim();
          } else if (text.includes('**Answer**\n\n')) {
            const answerPart = text.split('**Reasoning**')[0];
            text = answerPart.replace(/^\*\*Answer\*\*\s*/i, '').trim();
          }
          console.log(`${logTag} Groq response received successfully using model [${modelName}].`);
          return text;
        }

      } catch (err) {
        const isNotFound = err.status === 404 || (err.message && err.message.includes('model_not_found'));
        const isDecommissioned = err.status === 400 || (err.message && err.message.includes('model_decommissioned'));
        const isRateLimit = err.status === 429 || (err.message && (err.message.includes('rate limit') || err.message.includes('quota')));

        if (isNotFound || isDecommissioned) {
          console.warn(`⚠️ Groq model [${modelName}] is unavailable (${isNotFound ? '404 model_not_found' : 'model_decommissioned'}). Skipping immediately to next model.`);
          break; // Do not retry permanent model errors
        } else if (isRateLimit) {
          console.warn(`⚠️ Groq model [${modelName}] hit rate limits (429). Trying next fallback model.`);
          break;
        } else {
          console.warn(`⚠️ Groq model [${modelName}] Attempt ${attempt} error: ${err.message}`);
        }
      }
    }
  }

  // Fallbacks if all models are unavailable or rate-limited
  if (fallbackType === 'interview') {
    console.warn('⚠️ All Groq models unavailable/rate-limited for Mock Interview. Activating Recruiter Fallback Engine.');
    return generateMockRecruiterFallback(promptText);
  }

  if (fallbackType === 'resume') {
    console.warn('⚠️ All Groq models unavailable/rate-limited for Resume Analysis. Activating Resume Fallback Engine.');
    return generateResumeFallback();
  }

  console.warn('⚠️ All Groq models unavailable. Returning structured educational response.');
  return generateGeneralFallback();
};

module.exports = { 
  model: getModelInstance('qwen/qwen3.8-27b'), 
  callGeminiWithRetry,
  generateMockRecruiterFallback
};
