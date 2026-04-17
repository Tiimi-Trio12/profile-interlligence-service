const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Create a single Prisma instance
// WHY: prevents multiple DB connections in dev server reloads
function getConnectionString() {
	const explicitUrl =
		process.env.DATABASE_URL ||
		process.env.DIRECT_URL ||
		process.env.DATABASE_PRIVATE_URL ||
		process.env.POSTGRES_URL ||
		process.env.POSTGRES_PRISMA_URL ||
		process.env.POSTGRES_PRIVATE_URL;

	if (explicitUrl) return explicitUrl;

	// Fallback for platforms that expose split PG variables.
	const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;
	if (PGHOST && PGPORT && PGUSER && PGPASSWORD && PGDATABASE) {
		return `postgresql://${encodeURIComponent(PGUSER)}:${encodeURIComponent(PGPASSWORD)}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
	}

	return null;
}

const connectionString = getConnectionString();

if (!connectionString) {
	throw new Error('No database connection env variable found. Set DATABASE_URL, DIRECT_URL, DATABASE_PRIVATE_URL, POSTGRES_URL, or PG* variables.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({
	adapter,
});

module.exports = { prisma };