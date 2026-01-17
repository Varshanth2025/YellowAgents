const OpenAI = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate chat completion using OpenAI
 * @param {Array} messages - Array of message objects with role and content
 * @param {String} model - OpenAI model to use
 * @returns {Promise<String>} - AI response content
 */
exports.getChatCompletion = async (messages, model = "gpt-3.5-turbo") => {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    throw new Error("Failed to get AI response");
  }
};
