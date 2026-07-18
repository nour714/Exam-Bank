import { requestManager } from '../core/request-manager.js';
import { measure } from '../core/observability.js';
import { eventBus } from '../core/event-bus.js';

let provider = null;

export const setAiProvider = (p) => {
  provider = p;
};

export const aiService = {
  /**
   * Request AI to generate questions.
   * This is an asynchronous operation. The backend/mock will enqueue a job.
   * The UI should listen for 'ai.generation.progress', 'ai.generation.completed', and 'ai.generation.failed' events.
   * @param {Object} request - The generation parameters.
   * @returns {Promise<{jobId: string}>}
   */
  async generateQuestions(request) {
    if (!provider) throw new Error('[AIService] No provider set.');
    
    const requestKey = `ai:generate:${JSON.stringify(request)}`;
    
    return requestManager.execute(requestKey, async () => {
      return measure('ai.generateQuestions', 'api', async () => {
        const result = await provider.generateQuestions(request);
        return result; 
      });
    });
  },

  /**
   * Cancel an ongoing generation request.
   * @param {string} jobId 
   */
  async cancelGeneration(jobId) {
    if (!provider) throw new Error('[AIService] No provider set.');
    return provider.cancelGeneration(jobId);
  }
};
