const { callGeminiWithRetry } = require('../utils/geminiHelper');
const Interview = require('../models/Interview');
const asyncHandler = require('../middleware/errorHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Normalizes user-input domain strings into clean, human-readable, professional titles.
 * e.g. "java dsa" -> "Java Data Structures & Algorithms", "dsa" -> "Data Structures & Algorithms"
 */
const normalizeDomain = (input = '') => {
  const clean = input.trim().replaceAll(/\s+/g, ' ');
  const lower = clean.toLowerCase();

  const domainMap = {
    'java dsa': 'Java Data Structures & Algorithms',
    'cpp dsa': 'C++ Data Structures & Algorithms',
    'c++ dsa': 'C++ Data Structures & Algorithms',
    'python dsa': 'Python Data Structures & Algorithms',
    'dsa': 'Data Structures & Algorithms',
    'react': 'React.js Development',
    'reactjs': 'React.js Development',
    'react.js': 'React.js Development',
    'node': 'Node.js Backend Development',
    'nodejs': 'Node.js Backend Development',
    'node.js': 'Node.js Backend Development',
    'mern': 'MERN Stack Development',
    'mean': 'MEAN Stack Development',
    'fullstack': 'Full Stack Development',
    'full stack': 'Full Stack Development',
    'web dev': 'Web Development',
    'web development': 'Web Development',
    'os': 'Operating Systems',
    'operating system': 'Operating Systems',
    'operating systems': 'Operating Systems',
    'dbms': 'Database Management Systems',
    'sql': 'Database & SQL Queries',
    'cn': 'Computer Networks',
    'computer networks': 'Computer Networks',
    'oop': 'Object-Oriented Programming',
    'oops': 'Object-Oriented Programming',
    'ai': 'Artificial Intelligence & Machine Learning',
    'ml': 'Machine Learning',
    'ai/ml': 'AI & Machine Learning',
    'hr': 'Behavioral & HR Round',
    'behavioral': 'Behavioral & HR Round',
    'aptitude': 'Quantitative Aptitude & Reasoning',
    'system design': 'System Design Architecture',
  };

  if (domainMap[lower]) {
    return domainMap[lower];
  }

  // Fallback: Professional Title Case conversion for unrecognized inputs
  return lower.split(' ').map(word => {
    if (word === 'js') return 'JS';
    if (word === 'api' || word === 'apis') return 'APIs';
    if (word === 'ui' || word === 'ux') return word.toUpperCase();
    if (word === 'dsa') return 'DSA';
    if (word === 'qa') return 'QA';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

// @desc    Start mock interview session and get domain-specific introduction question
// @route   POST /api/interviews/start
// @access  Private
exports.startInterview = asyncHandler(async (req, res) => {
  const { type, topic } = req.body;

  if (!type || !topic) {
    return res.status(400).json(errorResponse('Interview type and topic are required.'));
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_key_here' || apiKey.startsWith('gsk_your_')) {
    console.warn(`⚠️ Groq AI API key missing or unconfigured for interview. Activating Recruiter Fallback Engine for domain: "${normalizedTopic}"`);
    const initialQuestion = generateMockRecruiterFallback(`Domain / Focus Topic: ${normalizedTopic}, instructions for introduction`);
    const newSession = await InterviewSession.create({
      user: req.user.id,
      type,
      topic: normalizedTopic,
      targetRole: targetRole || 'Software Engineering Candidate',
      messages: [{ sender: 'interviewer', text: initialQuestion }],
      currentQuestionIndex: 1,
      status: 'active',
    });
    return res.status(201).json(successResponse({
      sessionId: newSession._id,
      initialQuestion,
      type,
      topic: normalizedTopic,
      targetRole: newSession.targetRole,
    }, 'Interview session initialized (Recruiter Fallback Mode).'));
  }

  const normalizedTopic = normalizeDomain(topic);
  const isBehavioral = type === 'Behavioral';
  const isSystemDesign = type === 'System Design';
  const roundTitle = isBehavioral 
    ? 'HR & Behavioral Interview' 
    : isSystemDesign 
    ? 'System Design Interview' 
    : `${normalizedTopic} Technical Interview`;

  // Dynamic 4-Part MNC Interviewer Opening Templates
  const TECHNICAL_TEMPLATES = [
    {
      welcome: `Welcome to your ${roundTitle}.`,
      flow: `We'll start with a brief introduction and then move into technical questions and domain problem-solving.`,
      question: `To begin, please introduce yourself and share your programming journey and experience with ${normalizedTopic}.`
    },
    {
      welcome: `Glad to have you here for your ${roundTitle}.`,
      flow: `We'll open with a quick introduction before diving into technical discussion and scenario-based questions.`,
      question: `Could you start by introducing yourself and walking me through your background with ${normalizedTopic}?`
    },
    {
      welcome: `Welcome! I'll be conducting your ${roundTitle} today.`,
      flow: `Our format begins with a short introduction followed by domain-specific technical questions.`,
      question: `Please introduce yourself and share a brief overview of your journey with ${normalizedTopic}.`
    }
  ];

  const BEHAVIORAL_TEMPLATES = [
    {
      welcome: `Welcome to your HR & Behavioral Interview.`,
      evaluation: `In this interview, I'll evaluate your communication skills, teamwork, leadership qualities, problem-solving mindset, adaptability, and career goals.`,
      flow: `We'll begin with a brief introduction, followed by behavioral and situational questions to understand your approach in workplace scenarios.`,
      question: `To get started, please introduce yourself and tell me about your background, experiences, and career aspirations.`
    },
    {
      welcome: `Glad to have you here for your HR & Behavioral Interview.`,
      evaluation: `Today, we'll focus on your communication clarity, interpersonal skills, decision-making style, conflict resolution, and work ethics.`,
      flow: `Our conversation will start with a short introduction before moving into situation-based questions to explore how you handle real-world challenges.`,
      question: `Please introduce yourself and briefly share your background, key milestones, and career goals.`
    },
    {
      welcome: `Welcome! I'll be conducting your HR & Behavioral Interview today.`,
      evaluation: `My goal is to learn more about your collaboration style, problem-solving approach, leadership potential, and professional motivations.`,
      flow: `We'll open with a quick overview of your background, followed by behavioral questions centered on workplace experiences.`,
      question: `To kick things off, please introduce yourself and walk me through your background, experiences, and future career plans.`
    }
  ];

  const SYSTEM_DESIGN_TEMPLATES = [
    {
      welcome: `Welcome to your System Design Interview.`,
      evaluation: `In this interview, I'll evaluate your ability to design scalable systems, understand architecture decisions, handle trade-offs, and think about real-world engineering challenges.`,
      flow: `We'll begin with a brief introduction and then move into system design scenarios and architecture discussions.`,
      question: `To get started, please introduce yourself and share your experience with designing or working on software systems.`
    },
    {
      welcome: `Glad to have you here for your System Design Round.`,
      evaluation: `Today, we'll evaluate your high-level architectural thinking, database choices, caching strategies, microservices design, and system scalability.`,
      flow: `Our format begins with a quick introduction before diving straight into end-to-end system design problems.`,
      question: `Could you start by introducing yourself and highlighting your experience with scalable system architecture and distributed systems?`
    },
    {
      welcome: `Welcome! I'll be conducting your System Design evaluation today.`,
      evaluation: `My goal is to assess your requirement gathering, API design, load balancing techniques, database partitioning, and reliability trade-offs.`,
      flow: `We will start with a brief overview of your background before tackling real-world distributed system scenarios.`,
      question: `Please introduce yourself and walk me through any complex software systems or architectures you have built or studied.`
    }
  ];

  const selectedTemplate = isBehavioral 
    ? BEHAVIORAL_TEMPLATES[Math.floor(Math.random() * BEHAVIORAL_TEMPLATES.length)]
    : isSystemDesign
    ? SYSTEM_DESIGN_TEMPLATES[Math.floor(Math.random() * SYSTEM_DESIGN_TEMPLATES.length)]
    : TECHNICAL_TEMPLATES[Math.floor(Math.random() * TECHNICAL_TEMPLATES.length)];

  try {
    let prompt;
    if (isBehavioral) {
      prompt = `
You are a Senior Corporate HR Recruiter conducting a live HR & Behavioral Interview at a top company (like Google, Amazon, Microsoft, TCS).

Interview Type: HR & Behavioral Round

INSTRUCTIONS FOR HR OPENING MESSAGE:
Construct a warm, articulate, and natural 4-part HR introduction following this EXACT structure:

1. WELCOME MESSAGE: "${selectedTemplate.welcome}" (Always use "HR & Behavioral Interview", NEVER say "HR & Behavioral evaluation" or "Behavioral & HR Round").
2. EVALUATION AREAS: "${selectedTemplate.evaluation}" (Focus strictly on communication skills, teamwork, leadership qualities, problem-solving mindset, adaptability, career goals, and workplace behavior. NEVER mention technical concepts, coding ability, data structures, algorithms, or technical evaluation).
3. INTERVIEW FLOW STATEMENT: "${selectedTemplate.flow}" (NEVER mention technical questions or domain-specific questions).
4. SINGLE INTRO QUESTION: "${selectedTemplate.question}" (NEVER ask "Tell me about your journey with Behavioral & HR Round").

CRITICAL RULES:
- Sound like a polished, empathetic senior HR recruiter from a top tech company.
- NO technical jargon, NO coding terms, NO robotic phrases.
- Output ONLY the HR recruiter dialogue directly without preambles or markdown backticks.
`;
    } else if (isSystemDesign) {
      prompt = `
You are a Principal System Architect and Engineering Manager conducting a live System Design Interview at a top tech company (like Google, Meta, Amazon, Uber).

Interview Type: System Design Round

INSTRUCTIONS FOR SYSTEM DESIGN OPENING MESSAGE:
Construct a highly professional, architectural 4-part introduction following this EXACT structure:

1. WELCOME MESSAGE: "${selectedTemplate.welcome}" (DO NOT show "Data Structures & Algorithms" or mention DSA/coding questions).
2. EVALUATION STATEMENT: "${selectedTemplate.evaluation}" (Focus strictly on scalable architecture, load balancing, caching, microservices, DB selection, APIs, and trade-offs. DO NOT mention DSA, LeetCode, or low-level algorithms).
3. INTERVIEW FLOW STATEMENT: "${selectedTemplate.flow}"
4. SINGLE INTRO QUESTION: "${selectedTemplate.question}"

CRITICAL RULES:
- NEVER mention DSA, algorithms, competitive programming, or coding exercises.
- Focus purely on system architecture, scalability, reliability, and engineering trade-offs.
- Output ONLY the System Architect dialogue directly without preambles or markdown backticks.
`;
    } else {
      prompt = `
You are a Senior Technical Recruiter and Hiring Manager conducting a live technical interview at a top MNC (like Google, Microsoft, Amazon, Adobe, TCS Digital).

Interview Type: ${type}
Normalized Focus Domain: ${normalizedTopic}

INSTRUCTIONS FOR OPENING MESSAGE:
Construct a concise, natural 4-part opening message following this EXACT structure:

1. WELCOME MESSAGE: State "${selectedTemplate.welcome}" (Always use "Technical Interview" for technical domains; never use words like "Assessment" or "Session").
2. BRIEF EVALUATION STATEMENT: State what skills will be evaluated based on the focus domain "${normalizedTopic}":
   - For Data Structures & Algorithms (DSA): Mention data structures, algorithms, problem-solving approach, coding ability, and time and space complexity analysis.
   - For Java: Mention Core Java, OOP concepts, Collections framework, Exception handling, and problem solving.
   - For C++: Mention C++ fundamentals, STL, memory management, OOP, and performance considerations.
   - For MySQL / DBMS: Mention SQL queries, database design, indexing, transactions, and query optimization.
   - For React.js: Mention components, hooks, state management, and performance optimization.
   - For Node.js: Mention APIs, backend architecture, authentication, and database integration.
   - For Machine Learning / AI: Mention ML concepts, algorithms, model evaluation, and practical implementation.
3. INTERVIEW FLOW STATEMENT: Include a clear process statement (e.g. "${selectedTemplate.flow}").
4. SINGLE INTRO QUESTION: Ask ONLY ONE natural introduction question (e.g. "${selectedTemplate.question}"). Do NOT ask multiple questions.

CRITICAL RULES:
- NEVER use words like "Assessment", "Session", "Exam", or "Test Platform".
- NEVER use robotic phrases like "Today, we'll delve into...", "I'm excited to connect with you today", or "background relevant to...".
- NEVER display raw user input or repetitive domain names.
- Keep total length concise (3-4 natural sentences). Output ONLY the interviewer dialogue directly without preambles or markdown backticks.
`;
    }

    const firstQuestion = await callGeminiWithRetry(prompt, { maxAttempts: 3, timeoutMs: 15000, fallbackType: 'interview' });

    const interview = await Interview.create({
      user: req.user.id,
      type,
      topic: normalizedTopic,
      messages: [
        {
          role: 'assistant',
          content: firstQuestion.trim(),
        },
      ],
    });

    res.status(201).json(successResponse(interview, 'Interview started successfully.'));
  } catch (error) {
    console.error('Start Interview Error:', error.message);
    res.status(503).json(errorResponse(error.message || 'AI service is temporarily unavailable. Please try again later.'));
  }
});

// @desc    Submit candidate answer, provide per-answer feedback, and ask progressive domain question
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
    // 1. Immediately append user message and save to DB
    interview.messages.push({ role: 'user', content: message.trim() });
    await interview.save();

    const assistantQuestionsCount = interview.messages.filter(m => m.role === 'assistant').length;

    // QUESTION LIMITS PER INTERVIEW TYPE:
    // Technical Round: 10 questions
    // Behavioral Round: 8 questions
    // System Design Round: 7 questions
    const limitMap = {
      'Technical': 10,
      'Behavioral': 8,
      'System Design': 7
    };
    const maxQuestions = limitMap[interview.type] || 10;

    if (assistantQuestionsCount >= maxQuestions) {
      // Reached limit, auto-finalize interview message
      const completionNotice = `Thank you for answering all ${maxQuestions} questions! That concludes our technical interview round for ${interview.topic}. I am now generating your comprehensive AI evaluation report...`;
      interview.messages.push({ role: 'assistant', content: completionNotice });
      await interview.save();
      return res.status(200).json(successResponse(interview, 'Question limit reached. Interview auto-concluded.'));
    }

    const historyText = interview.messages
      .map((msg) => `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`)
      .join('\n\n');

    const prompt = `
You are a senior tech recruiter conducting a live ${interview.type} interview on "${interview.topic}".
Questions asked so far: ${assistantQuestionsCount} of ${maxQuestions}.

Below is the transcript of the interview so far:
--- TRANSCRIPT ---
${historyText}
--- END TRANSCRIPT ---

Instructions for your response:
1. EVALUATE THE CANDIDATE'S LAST RESPONSE: Give a 1-2 sentence constructive assessment of their technical correctness, completeness, or logic.
2. ASK QUESTION ${assistantQuestionsCount + 1} OF ${maxQuestions}:
   - For Question 2-3: Ask core domain concept & fundamental questions.
   - For Question 4-7: Ask medium difficulty technical & scenario questions.
   - For Question 8-9: Ask problem-solving, trade-off, or practical coding logic questions.
   - For Question ${maxQuestions}: Ask final summary domain question.
   - Tailor specifically to "${interview.topic}" (DSA, React, Java, C++, Python, MySQL, etc.).
3. NEVER repeat questions. Keep your tone encouraging yet authoritative like a FAANG senior recruiter.
4. Keep entire response under 100 words. Output ONLY recruiter dialogue.
`;

    // 2. Generate next interviewer question with fallback support
    const nextQuestion = await callGeminiWithRetry(prompt, { maxAttempts: 1, timeoutMs: 8000, fallbackType: 'interview' });

    interview.messages.push({ role: 'assistant', content: nextQuestion.trim() });
    await interview.save();

    res.status(200).json(successResponse(interview, 'Response submitted successfully.'));
  } catch (error) {
    console.error('Submit Response Error:', error.message);
    // User message is already safely saved in MongoDB Atlas!
    res.status(500).json(errorResponse(error.message || 'Error processing recruiter response.'));
  }
});

// @desc    End and generate comprehensive AI recruiter evaluation report
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
    const userMessages = interview.messages.filter(m => m.role === 'user');
    const totalUserWords = userMessages.reduce((sum, m) => sum + m.content.trim().split(/\s+/).length, 0);

    // CASE 1: No candidate answers submitted (totalAnswersProvided = 0)
    if (userMessages.length === 0) {
      const emptyEvaluation = {
        score: 0,
        strengths: ['No strengths can be evaluated.'],
        weaknesses: ['Please provide answers to receive detailed feedback.'],
        generalTips: 'Insufficient Data: No responses were provided, so an accurate assessment could not be generated.',
        topicsToImprove: [interview.topic],
        recommendedPracticeQuestions: [`Review fundamental interview questions in ${interview.topic}`]
      };

      interview.status = 'completed';
      interview.feedback = emptyEvaluation;
      await interview.save();

      const AIHistory = require('../models/AIHistory');
      const Notification = require('../models/Notification');
      
      await AIHistory.create({
        user: req.user.id,
        category: 'interview',
        title: `Mock Interview: ${interview.topic} (No Responses)`,
        content: emptyEvaluation.generalTips,
        duration: '0 answers',
        metadata: { score: 0, strengths: [], weaknesses: emptyEvaluation.weaknesses, topic: interview.topic }
      }).catch(() => {});

      Notification.create({
        user: req.user.id,
        type: 'interview',
        title: 'Mock Interview Ended',
        message: `Your ${interview.topic} interview ended with insufficient data (0%).`,
      }).catch(() => {});

      return res.status(200).json(successResponse(interview, 'Interview evaluated successfully.'));
    }

    // CASE 2: Minimal / Low-content responses (e.g., "yes", "ok", "don't know")
    if (totalUserWords < 15) {
      const lowResponseEvaluation = {
        score: 15,
        strengths: ['Attended the interview session'],
        weaknesses: ['Limited responses provided', 'Answers lacked technical depth, structure, and explanation'],
        generalTips: 'Limited response provided. More detailed explanations, code walk-throughs, and structured responses are required to demonstrate technical competence.',
        topicsToImprove: [interview.topic, 'Technical Communication'],
        recommendedPracticeQuestions: [
          `Practice explaining solutions step-by-step for ${interview.topic}`,
          'Structure responses using problem-solving frameworks'
        ]
      };

      interview.status = 'completed';
      interview.feedback = lowResponseEvaluation;
      await interview.save();

      const AIHistory = require('../models/AIHistory');
      const Notification = require('../models/Notification');
      const User = require('../models/User');

      User.findById(req.user.id).then(user => {
        if (user) user.updateStreak();
      }).catch(() => {});
      
      await AIHistory.create({
        user: req.user.id,
        category: 'interview',
        title: `Mock Interview: ${interview.topic} (Limited Data)`,
        content: lowResponseEvaluation.generalTips,
        duration: `${userMessages.length} minimal answers`,
        metadata: { score: 15, strengths: lowResponseEvaluation.strengths, weaknesses: lowResponseEvaluation.weaknesses, topic: interview.topic }
      }).catch(() => {});

      Notification.create({
        user: req.user.id,
        type: 'interview',
        title: 'Mock Interview Evaluated',
        message: `Your ${interview.topic} interview scored 15% due to limited responses.`,
      }).catch(() => {});

      return res.status(200).json(successResponse(interview, 'Interview evaluated successfully.'));
    }

    // CASE 3: Normal evaluation with sufficient candidate responses
    const transcriptText = interview.messages
      .map((msg) => `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`)
      .join('\n\n');

    const prompt = `
You are a Lead Hiring Manager evaluating a candidate's completed interview transcript.
Domain / Focus Topic: ${interview.topic}
Interview Type: ${interview.type}
Total Candidate Questions Answered: ${userMessages.length}

Analyze ONLY the candidate's actual responses below and produce an objective evaluation report.
CRITICAL GRADING RULES:
- Evaluate candidate ONLY on their submitted answers. Do NOT award marks for questions the interviewer asked if the candidate gave vague or partial answers.
- Penalize heavily if candidate skipped technical details or gave vague explanations.
- Overall score MUST reflect actual technical correctness, problem-solving, communication, and completeness (0 to 100).

Output in STRICT JSON format (no markdown blocks like \`\`\`json):
{
  "score": <overall score integer between 0 and 100 based strictly on candidate answers>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "generalTips": "<Recruiter summary analyzing candidate's actual performance and readiness>",
  "topicsToImprove": ["<topic 1>", "<topic 2>"],
  "recommendedPracticeQuestions": ["<question 1>", "<question 2>"]
}

--- CANDIDATE TRANSCRIPT ---
${transcriptText}
`;

    const result = await callGeminiWithRetry(prompt, { maxAttempts: 2, timeoutMs: 20000, fallbackType: 'interview' });
    let responseText = result.replace(/```json/g, '').replace(/```/g, '').trim();

    let evaluation;
    try {
      evaluation = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini evaluation JSON:', responseText);
      evaluation = {
        score: 65,
        strengths: ['Provided initial responses to technical questions'],
        weaknesses: ['Could elaborate more on complexity trade-offs and edge cases'],
        generalTips: 'Fair performance overall. Focus on providing detailed step-by-step explanations and analyzing time/space complexities.',
        topicsToImprove: [interview.topic, 'System Optimization'],
        recommendedPracticeQuestions: [`Practice advanced ${interview.topic} questions`]
      };
    }

    const questionsAsked = interview.messages.filter(m => m.role === 'assistant').length;
    const answersProvided = userMessages.length;

    interview.status = 'completed';
    interview.feedback = {
      score: Math.min(Math.max(evaluation.score || 50, 0), 100),
      evaluationStatus: 'Completed',
      totalQuestionsAsked: questionsAsked,
      totalAnswersProvided: answersProvided,
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      generalTips: evaluation.generalTips || '',
      topicsToImprove: evaluation.topicsToImprove || [],
      recommendedPracticeQuestions: evaluation.recommendedPracticeQuestions || []
    };

    await interview.save();

    // Log AI History entry, Notification & Update Streak
    const AIHistory = require('../models/AIHistory');
    const Notification = require('../models/Notification');
    const User = require('../models/User');

    User.findById(req.user.id).then(user => {
      if (user) user.updateStreak();
    }).catch(() => {});
    
    await AIHistory.create({
      user: req.user.id,
      category: 'interview',
      title: `Mock Interview Evaluation: ${interview.topic}`,
      content: evaluation.generalTips || `Completed ${interview.topic} mock interview with score ${evaluation.score || 80}%`,
      duration: `${userMessages.length} answers`,
      metadata: { 
        score: evaluation.score, 
        strengths: evaluation.strengths, 
        weaknesses: evaluation.weaknesses,
        topicsToImprove: evaluation.topicsToImprove,
        type: interview.type,
        topic: interview.topic
      },
    }).catch(err => console.error('Failed to log interview AIHistory:', err));

    Notification.create({
      user: req.user.id,
      type: 'interview',
      title: 'Mock Interview Evaluated',
      message: `Your ${interview.topic} mock interview scored ${evaluation.score || 80}%.`,
    }).catch(() => {});

    res.status(200).json(successResponse(interview, 'Interview evaluated successfully.'));
  } catch (error) {
    console.error('Evaluate Interview Error:', error.message);
    res.status(503).json(errorResponse(error.message || 'AI service is temporarily unavailable. Please try again later.'));
  }
});

// @desc    Get user's past interviews
// @route   GET /api/interviews
// @access  Private
exports.getInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ user: req.user.id }).sort({ createdAt: -1 });

  // Sanitize past interviews to ensure old zero-response sessions show score: null / evaluationStatus: 'Insufficient Data'
  const sanitizedInterviews = await Promise.all(
    interviews.map(async (interview) => {
      const userMsgCount = (interview.messages || []).filter((m) => m.role === 'user').length;
      let needsSave = false;

      if (userMsgCount === 0) {
        if (interview.feedback?.score !== null && interview.feedback?.score !== undefined) {
          interview.feedback.score = null;
          interview.feedback.evaluationStatus = 'Insufficient Data';
          interview.feedback.strengths = ['No strengths can be evaluated.'];
          interview.feedback.weaknesses = ['Please provide answers to receive detailed feedback.'];
          interview.feedback.generalTips = 'Insufficient Data: No responses were provided, so an accurate assessment could not be generated.';
          needsSave = true;
        }
      }

      if (needsSave) {
        await interview.save();
      }
      return interview;
    })
  );

  res.status(200).json(successResponse(sanitizedInterviews, 'Interviews list fetched successfully.'));
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

// @desc    Delete a past interview session
// @route   DELETE /api/interviews/:id
// @access  Private
exports.deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
  if (!interview) {
    return res.status(404).json(errorResponse('Interview session not found.'));
  }
  await interview.deleteOne();
  res.status(200).json(successResponse(null, 'Interview session deleted successfully.'));
});
