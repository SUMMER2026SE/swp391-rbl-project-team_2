const Groq = require('groq-sdk');

const groqApiKey = process.env.GROQ_API_KEY || 'dummy_key';
const groq = new Groq({ apiKey: groqApiKey });
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

/**
 * Service to manage communication with Groq API
 */
class GroqService {
  /**
   * Generates a chat completion (non-streaming) with retry logic
   * @param {Array} messages List of message objects
   * @param {object} options Additional options (model, temperature, etc.)
   * @param {number} retries Number of retries left
   * @returns {Promise<string>} The assistant's reply
   */
  static async chatCompletion(messages, options = {}, retries = 3) {
    if (groqApiKey === 'dummy_key') {
      throw new Error('GROQ_API_KEY is not set.');
    }

    const model = options.model || DEFAULT_MODEL;
    const temperature = options.temperature !== undefined ? options.temperature : 0.2;
    const timeout = options.timeout || 30000; // Default 30s timeout

    try {
      const completion = await Promise.race([
        groq.chat.completions.create({
          messages,
          model,
          temperature,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Groq API request timed out')), timeout)
        ),
      ]);

      return completion.choices[0]?.message?.content || '';
    } catch (err) {
      if (retries > 1) {
        console.warn(`[GroqService] Error occurred: ${err.message}. Retrying... (${retries - 1} left)`);
        // Wait 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.chatCompletion(messages, options, retries - 1);
      }
      throw err;
    }
  }

  /**
   * Generates a streaming chat completion
   * @param {Array} messages List of message objects
   * @param {object} options Additional options
   * @returns {Promise<AsyncIterable<any>>} The stream iterable
   */
  static async chatCompletionStream(messages, options = {}) {
    if (groqApiKey === 'dummy_key') {
      throw new Error('GROQ_API_KEY is not set.');
    }

    const model = options.model || DEFAULT_MODEL;
    const temperature = options.temperature !== undefined ? options.temperature : 0.2;

    try {
      const stream = await groq.chat.completions.create({
        messages,
        model,
        temperature,
        stream: true,
      });
      return stream;
    } catch (err) {
      console.error('[GroqService] Streaming failed:', err.message);
      throw err;
    }
  }
}

module.exports = GroqService;
