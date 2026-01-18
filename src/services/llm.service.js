const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
exports.getChatResponse = async (systemPrompt, messages = [], options = {}) => {
  try {
    const {
      model = "gpt-3.5-turbo",
      temperature = 0.7,
      maxTokens = 1000,
    } = options;
    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];
    const response = await openai.chat.completions.create({
      model: model,
      messages: fullMessages,
      temperature: temperature,
      max_tokens: maxTokens,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    throw new Error("Failed to get AI response");
  }
};