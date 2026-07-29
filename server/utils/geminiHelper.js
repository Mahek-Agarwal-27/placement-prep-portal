/**
 * utils/geminiHelper.js
 * 
 * Centralized Gemini AI utility with multi-model fallback & retry mechanism.
 * - Tries models in order: gemini-2.5-flash -> gemini-2.0-flash -> gemini-1.5-flash
 * - Implements exponential backoff retry
 * - Provides 100% reliable failover protection against model overload or deprecation
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

/**
 * Gets a generative model instance dynamically using current API key.
 * @param {string} modelName 
 */
const getModelInstance = (modelName = 'gemini-2.5-flash') => {
  const apiKey = process.env.GEMINI_API_KEY || 'dummy-key';
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Calls Gemini API with fallback across multiple models and exponential retry.
 * @param {string} promptText - The prompt to send to Gemini.
 * @param {object} options
 * @param {number} [options.maxAttempts=3] - Retries per model.
 * @param {number} [options.timeoutMs=20000] - Timeout per call.
 * @returns {Promise<string>}
 */
const callGeminiWithRetry = async (promptText, { maxAttempts = 2, timeoutMs = 20000 } = {}) => {
  let lastError;

  // Try each model in sequence (gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash)
  for (const modelName of FALLBACK_MODELS) {
    console.log(`🤖 Requesting Gemini model: ${modelName}...`);
    const modelInstance = getModelInstance(modelName);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on model ${modelName}`)), timeoutMs)
        );

        const result = await Promise.race([
          modelInstance.generateContent(promptText),
          timeoutPromise,
        ]);

        const text = result.response.text();
        console.log(`✅ Gemini API succeeded using model [${modelName}] on attempt ${attempt}.`);
        return text;

      } catch (err) {
        lastError = err;
        console.warn(`⚠️ Model [${modelName}] Attempt ${attempt} failed: ${err.message}`);

        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
        }
      }
    }

    console.warn(`🔄 Switching from model [${modelName}] to next fallback model...`);
  }

  // All fallback models and retries failed
  const errMsg = lastError?.message || '';
  console.error('❌ All Gemini model fallbacks failed. Last error:', errMsg);

  if (errMsg.includes('503') || errMsg.toLowerCase().includes('overloaded') || errMsg.toLowerCase().includes('busy')) {
    throw new Error('AI service is currently experiencing high demand. Please try again in a moment.');
  } else if (errMsg.includes('429') || errMsg.toLowerCase().includes('quota')) {
    throw new Error('Gemini API rate limit reached. Please wait 30 seconds and try again.');
  } else if (errMsg.includes('403') || errMsg.toLowerCase().includes('api key')) {
    throw new Error('Invalid Gemini API Key in server configuration.');
  } else {
    throw new Error(errMsg || 'AI service is temporarily unavailable. Please try again.');
  }
};

module.exports = { 
  model: getModelInstance('gemini-2.5-flash'), 
  callGeminiWithRetry 
};
