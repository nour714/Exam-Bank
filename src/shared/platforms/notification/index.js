const notificationService = require('./notification.service');
const templateEngine = require('./template.engine');
const NotificationProvider = require('./providers/notification.provider');

module.exports = {
  notificationService,
  templateEngine,
  NotificationProvider,
};
