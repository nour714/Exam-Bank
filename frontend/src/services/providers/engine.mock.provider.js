import { ExamsMockProvider } from './exams.mock.provider.js';

let nextAttemptId = 1;
const attempts = new Map(); // id -> { id, examId, status, answers: Map<questionId, answerData> }

export const EngineMockProvider = {
  async startAttempt(examId, metadata = {}) {
    return new Promise(resolve => {
      setTimeout(() => {
        const id = `attempt-${nextAttemptId++}`;
        const attempt = { id, examId, status: 'STARTED', metadata, startedAt: new Date().toISOString(), answers: new Map() };
        attempts.set(id, attempt);
        resolve({ id: attempt.id, examId: attempt.examId, status: attempt.status, startedAt: attempt.startedAt });
      }, 400);
    });
  },

  async getAttempt(attemptId) {
    return new Promise(async (resolve, reject) => {
      setTimeout(async () => {
        const attempt = attempts.get(attemptId);
        if (!attempt) return reject(new Error('Attempt not found'));
        try {
          const exam = await ExamsMockProvider.getExamById(attempt.examId);
          resolve({
            id: attempt.id,
            examId: attempt.examId,
            status: attempt.status,
            startedAt: attempt.startedAt,
            exam,
            answers: Array.from(attempt.answers.entries()).map(([questionId, answerData]) => ({ questionId, answerData }))
          });
        } catch (err) {
          reject(err);
        }
      }, 300);
    });
  },

  async saveAnswer(attemptId, questionId, answerData) {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const attempt = attempts.get(attemptId);
        if (!attempt) return reject(new Error('Attempt not found'));
        attempt.answers.set(questionId, answerData);

        // Simulate auto-grading for MCQ by looking up the exam's questions
        let isCorrect = null;
        let autoScore = 0;
        try {
          const exam = await ExamsMockProvider.getExamById(attempt.examId);
          const eq = exam.questions.find(q => q.questionId === questionId);
          if (eq && eq.question.type === 'MULTIPLE_CHOICE') {
            const correctChoice = eq.question.choices.find(c => c.isCorrect);
            isCorrect = answerData === correctChoice?.id;
            autoScore = isCorrect ? eq.points : 0;
          }
        } catch { /* ignore grading errors in mock */ }

        resolve({ attemptId, questionId, answerData, isCorrect, autoScore });
      }, 200);
    });
  },

  async submitAttempt(attemptId, remainingSecs) {
    return new Promise(async (resolve, reject) => {
      setTimeout(async () => {
        const attempt = attempts.get(attemptId);
        if (!attempt) return reject(new Error('Attempt not found'));

        try {
          const exam = await ExamsMockProvider.getExamById(attempt.examId);
          let totalScore = 0;
          for (const [questionId, answerData] of attempt.answers.entries()) {
            const eq = exam.questions.find(q => q.questionId === questionId);
            if (eq && eq.question.type === 'MULTIPLE_CHOICE') {
              const correctChoice = eq.question.choices.find(c => c.isCorrect);
              if (answerData === correctChoice?.id) totalScore += eq.points;
            }
          }
          const passed = totalScore >= exam.passingScore;
          attempt.status = 'AUTO_GRADED';
          attempt.score = totalScore;
          attempt.passed = passed;
          resolve({ id: attempt.id, examId: attempt.examId, status: attempt.status, score: totalScore, passed, remainingSecs });
        } catch (err) {
          reject(err);
        }
      }, 500);
    });
  }
};
