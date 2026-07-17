const { getPrismaClient } = require('../../shared/database');

class BillingRepository {
  constructor() {
    this._prisma = null;
  }

  get prisma() {
    if (!this._prisma) {
      this._prisma = getPrismaClient();
    }
    return this._prisma;
  }

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });
  }

  async getTenantSubscription(tenantId) {
    return this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });
  }

  async upsertSubscription(tenantId, data) {
    return this.prisma.tenantSubscription.upsert({
      where: { tenantId },
      create: { tenantId, ...data },
      update: data,
    });
  }

  async cancelSubscription(tenantId, cancelAtPeriodEnd = true) {
    return this.prisma.tenantSubscription.update({
      where: { tenantId },
      data: {
        status: cancelAtPeriodEnd ? undefined : 'canceled',
        cancelAtPeriodEnd,
      },
    });
  }
}

module.exports = new BillingRepository();
