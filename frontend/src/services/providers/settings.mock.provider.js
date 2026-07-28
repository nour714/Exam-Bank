export const SettingsMockProvider = {
  async getSettings() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          grade: 'الصف الثالث الثانوي',
          pathway: 'علمي علوم',
          emailNotifications: true,
          examReminders: true
        });
      }, 500);
    });
  },

  async saveSettings(payload) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ ...payload, savedAt: new Date().toISOString() });
      }, 600);
    });
  }
};
