const repo = require('../repositories/profile.repository');
const { getGender, getAge, getCountry } = require('../utils/apiClient');
const { getAgeGroup } = require('../utils/ageGroup');
const { getCountryName } = require('../utils/country');
const { buildListQuery } = require('../utils/queryBuilder');
const { parseQuery } = require('../utils/nlpParser');
const { validateExternalData } = require('../utils/validator');
const { generateId, isUuidV7 } = require('../utils/uuid');

function createValidationError(message = 'Invalid query parameters', statusCode = 422) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeName(name) {
  return String(name).trim().replace(/\s+/g, ' ');
}

// Main business logic function
async function createProfile(name) {
  if (typeof name !== 'string') {
    throw createValidationError('Invalid query parameters', 422);
  }

  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    throw new Error('Name is required');
  }

  // Step 1: Idempotency check (prevents duplicate insert)
  const existing = await repo.findByName(normalizedName);

  if (existing) {
    return {
      message: 'Profile already exists',
      data: existing
    };
  }

  // Step 2: Call all external APIs in parallel (performance optimization)
  const [gender, age, country] = await Promise.all([
    getGender(normalizedName),
    getAge(normalizedName),
    getCountry(normalizedName)
  ]);

  // Step 3: Validate external API responses (fail fast)
  validateExternalData(gender, age, country);

  // Step 4: Determine age group classification
  const age_group = getAgeGroup(age.age);

  // Step 5: Pick highest probability country
  const topCountry = country.country.sort(
    (a, b) => b.probability - a.probability
  )[0];

  const countryId = topCountry.country_id.toUpperCase();

  // Step 6: Build final structured profile object
  const profile = {
    id: generateId(),                          // UUID v7 unique identifier
    name: normalizedName,                      // trim input while preserving case
    gender: gender.gender,
    gender_probability: gender.probability,
    age: age.age,
    age_group,
    country_id: countryId,
    country_name: getCountryName(countryId),
    country_probability: topCountry.probability,
    created_at: new Date()                     // UTC ISO 8601 format on JSON serialization
  };

  // Step 7: Persist to database
  return await repo.createProfile(profile);
}

// Get single profile
async function getProfileById(id) {
  if (!isUuidV7(id)) {
    throw createValidationError('Invalid query parameters', 422);
  }

  const profile = await repo.findById(id);

  if (!profile) {
    throw createValidationError('Profile not found', 404);
  }

  return profile;
}

// Get all profiles with filters, sorting, and pagination
async function listProfiles(query) {
  const { where, orderBy, page, limit, skip, take } = buildListQuery(query || {});

  const [total, data] = await Promise.all([
    repo.count(where),
    repo.findAll({ where, orderBy, skip, take })
  ]);

  return {
    page,
    limit,
    total,
    data
  };
}

// Natural language search endpoint
async function searchProfiles(query) {
  const input = query || {};
  const { q, ...rest } = input;

  if (typeof q === 'undefined') {
    throw createValidationError('Invalid query parameters', 400);
  }

  const parsedFilters = parseQuery(q);

  return listProfiles({
    ...parsedFilters,
    ...rest
  });
}

// Delete profile
async function deleteProfile(id) {
  if (!isUuidV7(id)) {
    throw createValidationError('Invalid query parameters', 422);
  }

  await repo.deleteById(id);
}

module.exports = {
  createProfile,
  getProfileById,
  listProfiles,
  searchProfiles,
  deleteProfile
};