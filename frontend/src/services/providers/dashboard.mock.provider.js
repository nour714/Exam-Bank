export const DashboardMockProvider = {
  async getSummary() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          completedExams: 45,
          averageScore: 82,
          studyStreak: 12,
          studyHours: 34,
          recentExams: [
            { id: 1, title: 'اختبار الجبر الخطي', subject: 'الرياضيات', score: 92, date: 'قبل ساعتين' },
            { id: 2, title: 'فيزياء الكم', subject: 'الفيزياء', score: 78, date: 'أمس' },
            { id: 3, title: 'تاريخ مصر الحديث', subject: 'التاريخ', score: 85, date: 'قبل 3 أيام' }
          ]
        });
      }, 800);
    });
  },

  async getActivity() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { type: 'exam_completed', title: 'أكملت اختبار الجبر الخطي', description: 'حصلت على 92%', time: 'قبل ساعتين' },
          { type: 'achievement', title: 'إنجاز جديد: 10 أيام متتالية!', description: 'حافظت على سلسلة دراستك بنجاح', time: 'أمس' },
          { type: 'exam_started', title: 'بدأت اختبار فيزياء الكم', description: 'أسئلة متعددة الخيارات', time: 'أمس' }
        ]);
      }, 600);
    });
  },

  async getPerformanceData() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          labels: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
          scores: [65, 70, 68, 85, 82, 90, 92]
        });
      }, 1000);
    });
  }
};
