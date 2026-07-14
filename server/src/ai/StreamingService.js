/**
 * Service to manage Server-Sent Events (SSE) streaming formatting and delivery.
 */
class StreamingService {
  /**
   * Initializes response object headers for SSE stream
   * @param {object} res Express response object
   */
  static initStream(res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Establish stream immediately
  }

  /**
   * Sends a status update event
   * @param {object} res Express response
   * @param {string} status The status message
   */
  static sendStatus(res, status) {
    this.sendEvent(res, 'status', { status });
  }

  /**
   * Sends an answer content delta chunk
   * @param {object} res Express response
   * @param {string} delta Text fragment
   */
  static sendChunk(res, delta) {
    this.sendEvent(res, 'content', { delta });
  }

  /**
   * Sends web search sources
   * @param {object} res Express response
   * @param {Array} sources List of sources
   */
  static sendSources(res, sources) {
    this.sendEvent(res, 'sources', { sources });
  }

  /**
   * Sends follow-up questions
   * @param {object} res Express response
   * @param {Array<string>} followup Questions
   */
  static sendFollowups(res, followup) {
    this.sendEvent(res, 'followup', { followup });
  }

  /**
   * Finalizes the response stream
   * @param {object} res Express response
   */
  static sendDone(res) {
    res.write('data: [DONE]\n\n');
    res.end();
  }

  /**
   * General helper to write event data in standard SSE format
   * @param {object} res Express response
   * @param {string} type Event type
   * @param {object} data JSON serializable data payload
   */
  static sendEvent(res, type, data) {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  }
}

module.exports = StreamingService;
