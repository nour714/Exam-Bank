const ar = require('./locales/ar');
const en = require('./locales/en');
const { logger } = require('../logger');

const locales = {
  ar,
  en,
};

const DEFAULT_LOCALE = 'ar';

/**
 * Internationalization (i18n) Service.
 *
 * Usage in services/controllers:
 *   const { t } = require('../../shared/i18n');
 *   const message = t('auth.login_success', req.locale);
 */

/**
 * Translate a key to the given locale.
 * @param {string} key - Dot-notated translation key (e.g., 'auth.login_success')
 * @param {string} [locale] - Target locale code (e.g., 'ar', 'en')
 * @param {Object} [params] - Interpolation parameters (e.g., { name: 'Ahmed' })
 * @returns {string}
 */
function t(key, locale = DEFAULT_LOCALE, params = {}) {
  const dict = locales[locale] || locales[DEFAULT_LOCALE];
  let text = dict[key];

  if (!text) {
    // Fallback to default locale, then to the raw key
    text = locales[DEFAULT_LOCALE][key] || key;
    logger.warn({ key, locale }, 'i18n: Missing translation key');
  }

  // Simple interpolation: replace {{param}} with params.param
  if (params && typeof text === 'string') {
    Object.keys(params).forEach((param) => {
      text = text.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
    });
  }

  return text;
}

/**
 * Get all available locale codes.
 * @returns {string[]}
 */
function getAvailableLocales() {
  return Object.keys(locales);
}

/**
 * Express middleware that extracts locale from the Accept-Language header
 * and attaches a helper `req.t(key, params)` function.
 */
function i18nMiddleware(req, res, next) {
  const rawHeader = req.headers['accept-language'] || DEFAULT_LOCALE;
  const locale = rawHeader.split(',')[0].split('-')[0].toLowerCase();
  req.locale = locales[locale] ? locale : DEFAULT_LOCALE;

  // Convenience helper bound to the current request's locale
  req.t = (key, params) => t(key, req.locale, params);

  next();
}

module.exports = {
  t,
  i18nMiddleware,
  getAvailableLocales,
  DEFAULT_LOCALE,
};
