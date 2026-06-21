require('dotenv').config();
const Groq = require('groq-sdk');

async function main() {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    console.log("API KEY starts with:", groqApiKey ? groqApiKey.substring(0, 5) : "undefined");
    const groq = new Groq({ apiKey: groqApiKey });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a test bot.' },
        { role: 'user', content: 'Hello' }
      ],
      model: 'llama-3.3-70b-versatile',
    });
    console.log("Response:", chatCompletion.choices[0]?.message?.content);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
main();
