let provider = null;

export function setEngineProvider(p) {
  provider = p;
}

export const engineService = {
  async startAttempt(examId, metadata) {
    if (!provider) throw new Error('[EngineService] No provider set.');
    return provider.startAttempt(examId, metadata);
  },

  async getAttempt(attemptId) {
    if (!provider) throw new Error('[EngineService] No provider set.');
    return provider.getAttempt(attemptId);
  },

  async saveAnswer(attemptId, questionId, answerData) {
    if (!provider) throw new Error('[EngineService] No provider set.');
    return provider.saveAnswer(attemptId, questionId, answerData);
  },

  async submitAttempt(attemptId, remainingSecs) {
    if (!provider) throw new Error('[EngineService] No provider set.');
    return provider.submitAttempt(attemptId, remainingSecs);
  }
};
