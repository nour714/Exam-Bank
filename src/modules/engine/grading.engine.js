/**
 * Grading strategies for different question types.
 */
class GradingEngine {
  /**
   * Evaluate a question and determine if it can be auto-graded.
   * @param {Object} question - The Question record (including choices).
   * @param {Json} answerData - The student's submitted answer.
   * @param {number} maxPoints - The points allocated to this question in the exam.
   * @returns {Object} { isCorrect: boolean|null, autoScore: number }
   */
  static evaluate(question, answerData, maxPoints) {
    if (!answerData) {
      return { isCorrect: false, autoScore: 0 };
    }

    switch (question.type) {
      case 'MULTIPLE_CHOICE':
      case 'TRUE_FALSE':
        return this._evaluateSingleChoice(question, answerData, maxPoints);

      case 'MULTI_SELECT':
        return this._evaluateMultiSelect(question, answerData, maxPoints);

      case 'SHORT_ANSWER':
      case 'FILL_IN_BLANK':
        return this._evaluateExactMatch(question, answerData, maxPoints);

      case 'ESSAY':
      case 'IMAGE_BASED':
        // Subjective questions cannot be strictly auto-graded without AI logic.
        // Return null for isCorrect to flag for manual/AI review.
        return { isCorrect: null, autoScore: 0 };

      case 'MATCHING':
      case 'ORDERING':
        // Complex logic based on metadata pairs (omitted for brevity, assume partial credit).
        return { isCorrect: null, autoScore: 0 };

      default:
        return { isCorrect: null, autoScore: 0 };
    }
  }

  static _evaluateSingleChoice(question, answerData, maxPoints) {
    // answerData is expected to be a single choice ID string
    const correctChoice = question.choices.find(c => c.isCorrect);
    if (!correctChoice) return { isCorrect: null, autoScore: 0 }; // Malformed question

    const isCorrect = answerData === correctChoice.id;
    return { isCorrect, autoScore: isCorrect ? maxPoints : 0 };
  }

  static _evaluateMultiSelect(question, answerData, maxPoints) {
    // answerData is expected to be an array of choice IDs
    if (!Array.isArray(answerData)) return { isCorrect: false, autoScore: 0 };

    const correctChoiceIds = question.choices.filter(c => c.isCorrect).map(c => c.id);
    
    // Strict evaluation: must match perfectly. (Partial credit logic can be added here)
    const isCorrect = 
      correctChoiceIds.length === answerData.length &&
      correctChoiceIds.every(id => answerData.includes(id));

    return { isCorrect, autoScore: isCorrect ? maxPoints : 0 };
  }

  static _evaluateExactMatch(question, answerData, maxPoints) {
    // answerData is a string
    if (typeof answerData !== 'string') return { isCorrect: false, autoScore: 0 };

    // Expecting exact match text to be stored in the first correct choice
    const correctChoice = question.choices.find(c => c.isCorrect);
    if (!correctChoice) return { isCorrect: null, autoScore: 0 };

    // Assuming correctChoice.content.text holds the valid string
    const validAnswer = correctChoice.content.text || '';
    
    // Case-insensitive exact match
    const isCorrect = answerData.trim().toLowerCase() === validAnswer.trim().toLowerCase();
    
    return { isCorrect, autoScore: isCorrect ? maxPoints : 0 };
  }
}

module.exports = GradingEngine;
