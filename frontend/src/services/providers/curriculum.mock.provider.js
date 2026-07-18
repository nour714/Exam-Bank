/**
 * Stable Educational Entity Contract:
 * {
 *   id: string,
 *   name: string,
 *   slug: string,
 *   parentId: string | null,
 *   childrenCount: number,
 *   order: number,
 *   icon: string,
 *   color: string,
 *   metadata: { questionCount?, estimatedDuration?, completionRate?, difficulty?, lastUpdated? }
 * }
 */
export const CurriculumMockProvider = {
  async getSubjects(cacheKey) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 'math', name: 'الرياضيات', slug: 'math', parentId: null, childrenCount: 5, order: 1, icon: 'calculator', color: 'blue', metadata: { questionCount: 1250, difficulty: 'متوسط' } },
          { id: 'physics', name: 'الفيزياء', slug: 'physics', parentId: null, childrenCount: 4, order: 2, icon: 'zap', color: 'orange', metadata: { questionCount: 840, difficulty: 'صعب' } },
          { id: 'chemistry', name: 'الكيمياء', slug: 'chemistry', parentId: null, childrenCount: 6, order: 3, icon: 'flask-conical', color: 'green', metadata: { questionCount: 920, difficulty: 'متوسط' } },
          { id: 'history', name: 'التاريخ', slug: 'history', parentId: null, childrenCount: 3, order: 4, icon: 'scroll-text', color: 'amber', metadata: { questionCount: 450, difficulty: 'سهل' } }
        ]);
      }, 400);
    });
  },

  async getUnits(cacheKey, subjectId) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 'unit1', name: 'الوحدة الأولى: الأعداد والعمليات', slug: 'unit-1', parentId: subjectId, childrenCount: 3, order: 1, icon: 'book', color: 'indigo', metadata: { questionCount: 250, estimatedDuration: '6 ساعات' } },
          { id: 'unit2', name: 'الوحدة الثانية: الجبر والدوال', slug: 'unit-2', parentId: subjectId, childrenCount: 4, order: 2, icon: 'book', color: 'violet', metadata: { questionCount: 320, estimatedDuration: '8 ساعات' } },
          { id: 'unit3', name: 'الوحدة الثالثة: الهندسة', slug: 'unit-3', parentId: subjectId, childrenCount: 2, order: 3, icon: 'book', color: 'cyan', metadata: { questionCount: 180, estimatedDuration: '4 ساعات' } }
        ]);
      }, 400);
    });
  },

  async getLessons(cacheKey, unitId) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 'lesson1', name: 'الدرس الأول: المقدمة والتعريفات', slug: 'lesson-1', parentId: unitId, childrenCount: 0, order: 1, icon: 'file-text', color: 'emerald', metadata: { questionCount: 45, estimatedDuration: '45 دقيقة', completionRate: 78 } },
          { id: 'lesson2', name: 'الدرس الثاني: التطبيقات العملية', slug: 'lesson-2', parentId: unitId, childrenCount: 0, order: 2, icon: 'file-text', color: 'sky', metadata: { questionCount: 62, estimatedDuration: '60 دقيقة', completionRate: 45 } },
          { id: 'lesson3', name: 'الدرس الثالث: التمارين والمراجعة', slug: 'lesson-3', parentId: unitId, childrenCount: 0, order: 3, icon: 'file-text', color: 'rose', metadata: { questionCount: 38, estimatedDuration: '30 دقيقة', completionRate: 12 } }
        ]);
      }, 400);
    });
  }
};
