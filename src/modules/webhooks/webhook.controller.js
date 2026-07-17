const webhookRepository = require('./webhook.repository');
const crypto = require('crypto');
const { z } = require('zod');

const createEndpointSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
});

class WebhookController {
  async getEndpoints(req, res) {
    const endpoints = await webhookRepository.getEndpoints(req.tenantId);
    res.status(200).json({ success: true, data: endpoints });
  }

  async createEndpoint(req, res) {
    const data = createEndpointSchema.parse(req.body);
    const secret = crypto.randomBytes(24).toString('hex'); // Generate a signing secret
    
    const endpoint = await webhookRepository.createEndpoint(req.tenantId, {
      ...data,
      secret,
    });
    
    res.status(201).json({ success: true, data: endpoint });
  }
}

module.exports = new WebhookController();
