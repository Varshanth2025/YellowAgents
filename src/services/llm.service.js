const OpenAI = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Send messages to OpenAI and get response
 *
 * @param {String} systemPrompt - The system prompt defining AI behavior
 * @param {Array} messages - Array of previous messages [{ role: 'user'|'assistant', content: '...' }]
 * @param {Object} options - Optional settings (model, temperature, maxTokens)
 * @returns {Promise<String>} - AI assistant's response text
 */
exports.getChatResponse = async (systemPrompt, messages = [], options = {}) => {
  try {
    const {
      model = "gpt-3.5-turbo",
      temperature = 0.7,
      maxTokens = 1000,
    } = options;

    // Build the full message array with system prompt first
    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: model,
      messages: fullMessages,
      temperature: temperature,
      max_tokens: maxTokens,
    });

    // Return the assistant's response text
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    throw new Error("Failed to get AI response");
  }
};
