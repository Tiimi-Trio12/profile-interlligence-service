const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Create a single Prisma instance
// WHY: prevents multiple DB connections in dev server reloads
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL (or DIRECT_URL) is required for Prisma database connection.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({
	adapter,
});

module.exports = { prisma };