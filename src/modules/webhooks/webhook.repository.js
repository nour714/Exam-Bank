const { getPrismaClient } = require('../../shared/database');

class WebhookRepository {
  constructor() {
    this._prisma = null;
  }

  get prisma() {
    if (!this._prisma) {
      this._prisma = getPrismaClient();
    }
    return this._prisma;
  }

  async createEndpoint(tenantId, data) {
    return this.prisma.webhookEndpoint.create({
      data: { tenantId, ...data },
    });
  }

  async getEndpoints(tenantId) {
    return this.prisma.webhookEndpoint.findMany({
      where: { tenantId, isActive: true },
    });
  }

  async logDelivery(endpointId, data) {
    return this.prisma.webhookDelivery.create({
      data: { endpointId, ...data },
    });
  }
}

module.exports = new WebhookRepository();
