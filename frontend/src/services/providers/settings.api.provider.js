import { authService } from '../auth.service.js';

export const SettingsApiProvider = {
  async getSettings() {
    const user = await authService.getProfile();
    return {
      grade: user.grade || null,
      pathway: user.pathway || null,
      emailNotifications: user.emailNotifications ?? true,
      examReminders: user.examReminders ?? true
    };
  },

  async saveSettings(payload) {
    const user = await authService.updateProfile(payload);
    return {
      grade: user.grade || null,
      pathway: user.pathway || null,
      emailNotifications: user.emailNotifications ?? true,
      examReminders: user.examReminders ?? true
    };
  }
};
