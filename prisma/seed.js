const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { v7: uuidv7 } = require('uuid');

function getConnectionString() {
  const explicitUrl =
    process.env.DATABASE_URL ||
    process.env.DIRECT_URL ||
    process.env.DATABASE_PRIVATE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_PRIVATE_URL;

  if (explicitUrl) {
    return explicitUrl;
  }

  const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;

  if (PGHOST && PGPORT && PGUSER && PGPASSWORD && PGDATABASE) {
    return `postgresql://${encodeURIComponent(PGUSER)}:${encodeURIComponent(PGPASSWORD)}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
  }

  return null;
}

function normalizeName(name) {
  return String(name).trim().replace(/\s+/g, ' ');
}

async function main() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error('No database connection env variable found.');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const seedPath = path.join(__dirname, '..', 'seed_profiles.json');
    const rawSeed = fs.readFileSync(seedPath, 'utf8');
    const parsedSeed = JSON.parse(rawSeed);
    const profiles = Array.isArray(parsedSeed?.profiles) ? parsedSeed.profiles : [];

    if (profiles.length !== 2026) {
      throw new Error(`Expected 2026 seed profiles, received ${profiles.length}`);
    }

    const normalizedProfiles = [];

    for (const profile of profiles) {
      const name = normalizeName(profile.name);

      if (!name) {
        throw new Error('Seed data contains an empty name');
      }

      normalizedProfiles.push({
        id: uuidv7(),
        name,
        gender: profile.gender,
        gender_probability: profile.gender_probability,
        age: profile.age,
        age_group: profile.age_group,
        country_id: String(profile.country_id).trim().toUpperCase(),
        country_name: String(profile.country_name).trim(),
        country_probability: profile.country_probability,
        created_at: new Date()
      });
    }

    const batchSize = 250;

    for (let index = 0; index < normalizedProfiles.length; index += batchSize) {
      const batch = normalizedProfiles.slice(index, index + batchSize);

      await prisma.profile.createMany({
        data: batch,
        skipDuplicates: true
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});