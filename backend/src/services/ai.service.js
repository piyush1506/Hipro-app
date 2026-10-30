const { askGemini } = require('./gemini.service');
const { askGroq } = require('./groq.service');

// Fast regex check for explicit human requests
const HUMAN_REQUEST_PATTERN = /\b(human|agent|real person|customer support|support agent|call me|talk to someone|representative|helpline|executive|complaint|refund|cancel)\b/i;

/**
 * Execute an async AI call with a strict timeout
 */
function withTimeout(promise, ms = 12000) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`AI Request timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * AI Response Router with Automatic Groq Fallback
 * Strictly Read-Only: Never executes database writes.
 */
async function generateAIResponse(messages, knowledge, customerContext = null) {
  const latestMessage = messages[messages.length - 1]?.content || '';

  // 1. Explicit human support request: immediately route to human
  if (HUMAN_REQUEST_PATTERN.test(latestMessage)) {
    return {
      reply: 'Connecting you with our support team right now. An agent will assist you shortly.',
      escalate: true,
      reason: 'Customer requested human assistance',
      provider: 'none'
    };
  }

  // 2. Primary: Google Gemini
  try {
    const result = await withTimeout(askGemini(messages, knowledge, customerContext), 12000);
    return {
      reply: result.reply || 'How else can I assist you today?',
      escalate: !!result.escalate,
      reason: result.reason || null,
      provider: 'gemini'
    };
  } catch (geminiError) {
    console.warn(`[AI Service] Primary Gemini failed: ${geminiError.message}. Switching to Groq fallback...`);

    // 3. Fallback: Groq
    try {
      const groqResult = await withTimeout(askGroq(messages, knowledge, customerContext), 12000);
      return {
        reply: groqResult.reply || 'How else can I assist you today?',
        escalate: !!groqResult.escalate,
        reason: groqResult.reason || null,
        provider: 'groq'
      };
    } catch (groqError) {
      console.error(`[AI Service] Groq fallback failed: ${groqError.message}`);

      // 4. Graceful degradation: escalate to human support without losing the message
      return {
        reply: "I'm having trouble processing this right now. Let me connect you directly with our support team.",
        escalate: true,
        reason: 'AI engine unavailable',
        provider: 'none'
      };
    }
  }
}

module.exports = { generateAIResponse };

