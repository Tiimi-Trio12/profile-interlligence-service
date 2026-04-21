const { findCountryCodeInText } = require('./country');

function createQueryError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function addAgeRange(filters, minimumAge, maximumAge) {
  if (Number.isInteger(minimumAge)) {
    filters.min_age = minimumAge;
  }

  if (Number.isInteger(maximumAge)) {
    filters.max_age = maximumAge;
  }
}

function captureAgeValue(text, pattern, assignTo, filters) {
  const match = text.match(pattern);

  if (!match) {
    return;
  }

  const age = Number(match[1]);

  if (!Number.isInteger(age) || age < 0) {
    throw createQueryError('Invalid query parameters', 422);
  }

  filters[assignTo] = age;
}

function parseQuery(q) {
  if (typeof q !== 'string') {
    throw createQueryError('Invalid query parameters', 422);
  }

  const text = q.trim();

  if (!text) {
    throw createQueryError('Invalid query parameters', 400);
  }

  const normalizedText = text.toLowerCase();
  const filters = {};

  // Gender
  const genders = new Set();

  if (/\b(female|females|woman|women|girl|girls)\b/i.test(normalizedText)) {
    genders.add('female');
  }

  if (/\b(male|males|man|men|boy|boys)\b/i.test(normalizedText)) {
    genders.add('male');
  }

  if (genders.size === 1) {
    filters.gender = [...genders][0];
  }

  // Age keywords
  if (/\byoung\b/i.test(normalizedText)) {
    addAgeRange(filters, 16, 24);
  }

  const ageGroupRules = [
    { pattern: /\b(child|children|kid|kids)\b/i, value: 'child' },
    { pattern: /\b(teen|teenager|teenagers|teenage)\b/i, value: 'teenager' },
    { pattern: /\b(adult|adults)\b/i, value: 'adult' },
    { pattern: /\b(senior|seniors|elderly|older people|old people)\b/i, value: 'senior' }
  ];

  for (const rule of ageGroupRules) {
    if (rule.pattern.test(normalizedText)) {
      filters.age_group = rule.value;
      break;
    }
  }

  // Numeric age patterns
  captureAgeValue(normalizedText, /\b(?:above|over|older than|greater than)\s+(\d{1,3})\b/i, 'min_age', filters);
  captureAgeValue(normalizedText, /\b(?:at least|minimum of|minimum)\s+(\d{1,3})\b/i, 'min_age', filters);
  captureAgeValue(normalizedText, /\b(?:below|under|younger than|less than)\s+(\d{1,3})\b/i, 'max_age', filters);
  captureAgeValue(normalizedText, /\b(?:at most|no more than|up to)\s+(\d{1,3})\b/i, 'max_age', filters);

  // Country detection
  const countryId = findCountryCodeInText(normalizedText);

  if (countryId) {
    filters.country_id = countryId;
  }

  if (Object.keys(filters).length === 0) {
    throw createQueryError('Unable to interpret query', 400);
  }

  if (
    Number.isInteger(filters.min_age) &&
    Number.isInteger(filters.max_age) &&
    filters.min_age > filters.max_age
  ) {
    throw createQueryError('Invalid query parameters', 422);
  }

  return filters;
}

module.exports = { parseQuery };