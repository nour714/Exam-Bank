let provider = null;

export function setExamsProvider(p) {
  provider = p;
}

export const examsService = {
  async getExams(params) {
    if (!provider) throw new Error('[ExamsService] No provider set.');
    return provider.getExams(params);
  },

  async getExamById(id) {
    if (!provider) throw new Error('[ExamsService] No provider set.');
    return provider.getExamById(id);
  }
};
