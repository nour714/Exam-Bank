const { PrismaClient } = require('@prisma/client');
const { logger } = require('../logger');

let prisma;

/**
 * Returns a singleton Prisma client instance.
 * Lazy-initialized to avoid connection attempts during module loading.
 */
function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    prisma.$on('query', (e) => {
      logger.debug({ query: e.query, duration: e.duration }, 'Prisma Query');
    });

    prisma.$on('error', (e) => {
      logger.error({ message: e.message }, 'Prisma Error');
    });

    prisma.$on('warn', (e) => {
      logger.warn({ message: e.message }, 'Prisma Warning');
    });
  }

  return prisma;
}

/**
 * Gracefully disconnect Prisma.
 */
async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Prisma disconnected');
  }
}

module.exports = {
  getPrismaClient,
  disconnectPrisma,
};
