const VALID_GENDERS = new Set(['male', 'female']);
const VALID_AGE_GROUPS = new Set(['child', 'teenager', 'adult', 'senior']);
const VALID_SORT_FIELDS = new Set(['age', 'created_at', 'gender_probability']);
const ALLOWED_QUERY_KEYS = new Set([
  'gender',
  'age_group',
  'country_id',
  'min_age',
  'max_age',
  'min_gender_probability',
  'min_country_probability',
  'sort_by',
  'order',
  'page',
  'limit'
]);

function createQueryError(message = 'Invalid query parameters', statusCode = 422) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeScalar(value) {
  if (Array.isArray(value)) {
    throw createQueryError();
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      throw createQueryError();
    }

    return trimmed;
  }

  return value;
}

function ensureAllowedQueryKeys(query) {
  for (const key of Object.keys(query || {})) {
    if (!ALLOWED_QUERY_KEYS.has(key)) {
      throw createQueryError();
    }
  }
}

function parseInteger(value, fieldName, { min, max, defaultValue } = {}) {
  if (value === undefined) {
    return defaultValue;
  }

  const normalizedValue = normalizeScalar(value);
  const parsedValue = Number(normalizedValue);

  if (!Number.isInteger(parsedValue)) {
    throw createQueryError();
  }

  if (typeof min === 'number' && parsedValue < min) {
    throw createQueryError();
  }

  if (typeof max === 'number' && parsedValue > max) {
    throw createQueryError();
  }

  return parsedValue;
}

function parseProbability(value) {
  if (value === undefined) {
    return undefined;
  }

  const normalizedValue = normalizeScalar(value);
  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0 || parsedValue > 1) {
    throw createQueryError();
  }

  return parsedValue;
}

function buildFilters(query) {
  ensureAllowedQueryKeys(query);

  const filters = {};

  if (query.gender !== undefined) {
    const gender = normalizeScalar(query.gender).toLowerCase();

    if (!VALID_GENDERS.has(gender)) {
      throw createQueryError();
    }

    filters.gender = gender;
  }

  if (query.age_group !== undefined) {
    const ageGroup = normalizeScalar(query.age_group).toLowerCase();

    if (!VALID_AGE_GROUPS.has(ageGroup)) {
      throw createQueryError();
    }

    filters.age_group = ageGroup;
  }

  if (query.country_id !== undefined) {
    const countryId = normalizeScalar(query.country_id).toUpperCase();

    if (!/^[A-Z]{2}$/.test(countryId)) {
      throw createQueryError();
    }

    filters.country_id = countryId;
  }

  const minAge = parseInteger(query.min_age, 'min_age', { min: 0, max: 150 });
  const maxAge = parseInteger(query.max_age, 'max_age', { min: 0, max: 150 });

  if (minAge !== undefined || maxAge !== undefined) {
    if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
      throw createQueryError();
    }

    filters.age = {};

    if (minAge !== undefined) {
      filters.age.gte = minAge;
    }

    if (maxAge !== undefined) {
      filters.age.lte = maxAge;
    }
  }

  const minGenderProbability = parseProbability(query.min_gender_probability);
  const minCountryProbability = parseProbability(query.min_country_probability);

  if (minGenderProbability !== undefined) {
    filters.gender_probability = {
      gte: minGenderProbability
    };
  }

  if (minCountryProbability !== undefined) {
    filters.country_probability = {
      gte: minCountryProbability
    };
  }

  return filters;
}

function buildSorting(query) {
  if (query.sort_by === undefined) {
    if (query.order !== undefined) {
      throw createQueryError();
    }

    return null;
  }

  const sortBy = normalizeScalar(query.sort_by).toLowerCase();

  if (!VALID_SORT_FIELDS.has(sortBy)) {
    throw createQueryError();
  }

  const order = query.order === undefined ? 'asc' : normalizeScalar(query.order).toLowerCase();

  if (order !== 'asc' && order !== 'desc') {
    throw createQueryError();
  }

  return {
    [sortBy]: order
  };
}

function buildPagination(query) {
  const page = parseInteger(query.page, 'page', { min: 1, defaultValue: 1 });
  const limit = parseInteger(query.limit, 'limit', { min: 1, max: 50, defaultValue: 10 });
  const skip = (page - 1) * limit;

  return { page, limit, skip, take: limit };
}

function buildListQuery(query) {
  const filters = buildFilters(query);
  const sorting = buildSorting(query);
  const pagination = buildPagination(query);

  return {
    where: filters,
    orderBy: sorting || [
      { created_at: 'asc' },
      { id: 'asc' }
    ],
    ...pagination
  };
}

module.exports = {
  buildFilters,
  buildSorting,
  buildPagination,
  buildListQuery
};