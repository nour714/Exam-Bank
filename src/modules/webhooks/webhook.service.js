const webhookRepository = require('./webhook.repository');
const crypto = require('crypto');

class WebhookService {
  /**
   * Dispatch a domain event to all subscribed tenant endpoints.
   */
  async dispatchEvent(tenantId, eventType, payload) {
    const endpoints = await webhookRepository.getEndpoints(tenantId);
    
    // Filter endpoints that subscribe to this event type
    const targets = endpoints.filter(ep => ep.events.includes(eventType) || ep.events.includes('*'));

    for (const endpoint of targets) {
      this._deliver(endpoint, eventType, payload).catch(err => {
        // Log delivery failure silently to not block the main event loop
        console.error(`Webhook delivery failed for ${endpoint.id}: ${err.message}`);
      });
    }
  }

  async _deliver(endpoint, eventType, payload) {
    const startTime = Date.now();
    const eventId = crypto.randomUUID();
    
    const requestBody = JSON.stringify({
      id: eventId,
      type: eventType,
      created: new Date().toISOString(),
      data: payload,
    });

    const headers = {
      'Content-Type': 'application/json',
      'X-ExamBank-Event': eventType,
      'X-ExamBank-Delivery': eventId,
    };

    if (endpoint.secret) {
      const signature = crypto.createHmac('sha256', endpoint.secret).update(requestBody).digest('hex');
      headers['X-ExamBank-Signature'] = `sha256=${signature}`;
    }

    try {
      // In production, this fetch should have a strict timeout and retry policy (e.g. BullMQ)
      const response = await fetch(endpoint.url, { method: 'POST', headers, body: requestBody });
      const responseBody = await response.text();
      
      await webhookRepository.logDelivery(endpoint.id, {
        eventId,
        eventType,
        requestPayload: payload,
        responseStatus: response.status,
        responseBody: responseBody.slice(0, 1000), // Trim long responses
        durationMs: Date.now() - startTime,
        status: response.ok ? 'success' : 'failed',
      });
    } catch (error) {
      await webhookRepository.logDelivery(endpoint.id, {
        eventId,
        eventType,
        requestPayload: payload,
        responseStatus: null,
        responseBody: error.message,
        durationMs: Date.now() - startTime,
        status: 'failed',
      });
    }
  }
}

module.exports = new WebhookService();
