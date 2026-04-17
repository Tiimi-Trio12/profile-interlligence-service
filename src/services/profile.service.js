const repo = require('../repositories/profile.repository');
const { getGender, getAge, getCountry } = require('../utils/apiClient');
const { getAgeGroup } = require('../utils/ageGroup');
const { validateExternalData } = require('../utils/validator');
const { generateId } = require('../utils/uuid');

// Main business logic function
async function createProfile(name) {
  const normalizedName = name.trim().toLowerCase();

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
    getGender(name),
    getAge(name),
    getCountry(name)
  ]);

  // Step 3: Validate external API responses (fail fast)
  validateExternalData(gender, age, country);

  // Step 4: Determine age group classification
  const age_group = getAgeGroup(age.age);

  // Step 5: Pick highest probability country
  const topCountry = country.country.sort(
    (a, b) => b.probability - a.probability
  )[0];

  // Step 6: Build final structured profile object
  const profile = {
    id: generateId(),                          // UUID v7 unique identifier
    name: normalizedName,                      // normalize input
    gender: gender.gender,
    gender_probability: gender.probability,
    sample_size: gender.count,                 // renamed from API "count"
    age: age.age,
    age_group,
    country_id: topCountry.country_id,
    country_probability: topCountry.probability,
    created_at: new Date().toISOString()       // UTC ISO 8601 format
  };

  // Step 7: Persist to database
  return await repo.createProfile(profile);
}

// Get single profile
async function getProfileById(id) {
  const profile = await repo.findById(id);

  if (!profile) {
    throw new Error('Profile not found');
  }

  return profile;
}

// Get all profiles with filters
async function getProfiles(filters) {
  return await repo.findAll(filters);
}

// Delete profile
async function deleteProfile(id) {
  await repo.deleteById(id);
}

module.exports = {
  createProfile,
  getProfileById,
  getProfiles,
  deleteProfile
};