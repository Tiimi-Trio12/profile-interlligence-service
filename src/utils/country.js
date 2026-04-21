const seedData = require('../../seed_profiles.json');

function normalizePhrase(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const codeToName = new Map();
const nameToCode = new Map();

for (const profile of Array.isArray(seedData?.profiles) ? seedData.profiles : []) {
  if (!profile?.country_id || !profile?.country_name) {
    continue;
  }

  const countryId = profile.country_id.toUpperCase();
  const countryName = String(profile.country_name).trim();

  codeToName.set(countryId, countryName);
  nameToCode.set(normalizePhrase(countryName), countryId);
}

const countryNamesByLength = [...nameToCode.keys()].sort((left, right) => right.length - left.length);

function getCountryName(countryId) {
  if (typeof countryId !== 'string') {
    return '';
  }

  const normalizedCountryId = countryId.trim().toUpperCase();
  return codeToName.get(normalizedCountryId) || normalizedCountryId;
}

function isCountryId(countryId) {
  return typeof countryId === 'string' && /^[A-Z]{2}$/i.test(countryId.trim());
}

function findCountryCodeInText(text) {
  const normalizedText = normalizePhrase(text);

  if (!normalizedText) {
    return null;
  }

  for (const countryName of countryNamesByLength) {
    const pattern = new RegExp(`(?:^|\\s)${escapeRegex(countryName)}(?:\\s|$)`, 'i');

    if (pattern.test(normalizedText)) {
      return nameToCode.get(countryName) || null;
    }
  }

  const normalizedLoose = normalizedText.replace(/\s+/g, ' ');

  for (const countryName of countryNamesByLength) {
    if (normalizedLoose.includes(countryName)) {
      return nameToCode.get(countryName) || null;
    }
  }

  const codeMatches = normalizedText.match(/\b[a-z]{2}\b/g) || [];

  for (const countryId of codeMatches) {
    const upperCountryId = countryId.toUpperCase();

    if (codeToName.has(upperCountryId)) {
      return upperCountryId;
    }
  }

  return null;
}

module.exports = {
  findCountryCodeInText,
  getCountryName,
  isCountryId,
  normalizePhrase
};