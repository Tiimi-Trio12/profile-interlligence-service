const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Create a single Prisma instance
// WHY: prevents multiple DB connections in dev server reloads
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({
	adapter,
});

module.exports = { prisma };