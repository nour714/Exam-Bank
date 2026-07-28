function choice(id, text, isCorrect = false) {
  return { id, content: { text }, isCorrect, order: 0 };
}

function mcq(id, text, choices, points = 5) {
  return {
    questionId: id,
    order: 0,
    points,
    question: {
      id,
      type: 'MULTIPLE_CHOICE',
      content: { text },
      choices
    }
  };
}

const EXAMS = [
  {
    id: 'exam-math-1',
    subjectId: 'math',
    title: 'امتحان الرياضيات - الجبر والتفاضل',
    description: 'مراجعة شاملة على الجبر والتفاضل والتكامل.',
    type: 'PRACTICE',
    durationMins: 90,
    passingScore: 5,
    totalPoints: 10,
    isPublished: true,
    questions: [
      mcq('q-math-1', 'ما ناتج مشتقة الدالة f(x) = x^2؟', [
        choice('c1', '2x', true),
        choice('c2', 'x'),
        choice('c3', 'x^2'),
        choice('c4', '2')
      ]),
      mcq('q-math-2', 'ما هو ناتج تكامل الدالة الثابتة f(x) = 5؟', [
        choice('c5', '5x + C', true),
        choice('c6', '5'),
        choice('c7', 'x + C'),
        choice('c8', '0')
      ])
    ]
  },
  {
    id: 'exam-physics-1',
    subjectId: 'physics',
    title: 'امتحان الفيزياء - الميكانيكا',
    description: 'أسئلة على قوانين نيوتن للحركة والطاقة.',
    type: 'PRACTICE',
    durationMins: 75,
    passingScore: 2,
    totalPoints: 5,
    isPublished: true,
    questions: [
      mcq('q-phys-1', 'ما هو قانون نيوتن الأول؟', [
        choice('c9', 'قانون القصور الذاتي', true),
        choice('c10', 'قانون التسارع'),
        choice('c11', 'قانون الفعل ورد الفعل'),
        choice('c12', 'قانون الجاذبية')
      ])
    ]
  },
  {
    id: 'exam-chemistry-1',
    subjectId: 'chemistry',
    title: 'امتحان الكيمياء - التفاعلات',
    description: 'أسئلة على التفاعلات الكيميائية والمعادلات الموزونة.',
    type: 'PRACTICE',
    durationMins: 80,
    passingScore: 2,
    totalPoints: 5,
    isPublished: true,
    questions: [
      mcq('q-chem-1', 'ما هو الرمز الكيميائي للماء؟', [
        choice('c13', 'H2O', true),
        choice('c14', 'CO2'),
        choice('c15', 'O2'),
        choice('c16', 'NaCl')
      ])
    ]
  },
  {
    id: 'exam-history-1',
    subjectId: 'history',
    title: 'امتحان التاريخ - مصر الحديثة',
    description: 'أسئلة على تاريخ مصر الحديث والمعاصر.',
    type: 'PRACTICE',
    durationMins: 60,
    passingScore: 2,
    totalPoints: 5,
    isPublished: true,
    questions: [
      mcq('q-hist-1', 'في أي عام قامت ثورة 23 يوليو؟', [
        choice('c17', '1952', true),
        choice('c18', '1919'),
        choice('c19', '1882'),
        choice('c20', '1956')
      ])
    ]
  }
];

export const ExamsMockProvider = {
  async getExams(params = {}) {
    return new Promise(resolve => {
      setTimeout(() => {
        let items = EXAMS.map(({ questions, ...rest }) => rest); // list view omits full question bodies
        if (params.subjectId) items = items.filter(e => e.subjectId === params.subjectId);
        resolve(items);
      }, 500);
    });
  },

  async getExamById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const exam = EXAMS.find(e => e.id === id);
        if (exam) resolve(exam);
        else reject(new Error('Exam not found'));
      }, 300);
    });
  }
};
