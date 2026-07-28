let provider = null;

export function setSettingsProvider(p) {
  provider = p;
}

export const settingsService = {
  async getSettings() {
    if (!provider) throw new Error('[SettingsService] No provider set.');
    return provider.getSettings();
  },

  async saveSettings(payload) {
    if (!provider) throw new Error('[SettingsService] No provider set.');
    return provider.saveSettings(payload);
  }
};
