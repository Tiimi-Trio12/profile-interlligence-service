const service = require('../services/profile.service');

// POST /profiles
async function createProfile(req, res, next) {
  try {
    const { name } = req.body || {};

    // Input validation (required field check)
    if (typeof name === 'undefined' || name === null || (typeof name === 'string' && !name.trim())) {
      return res.status(400).json({
        status: 'error',
        message: 'Name is required'
      });
    }

    if (typeof name !== 'string') {
      return res.status(422).json({
        status: 'error',
        message: 'Invalid query parameters'
      });
    }

    const result = await service.createProfile(name);

    // Idempotent response case
    if (result.message) {
      return res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data
      });
    }

    // Normal creation response
    return res.status(201).json({
      status: 'success',
      data: result
    });

  } catch (err) {
    next(err);
  }
}

// GET /profiles/:id
async function getProfile(req, res, next) {
  try {
    const profile = await service.getProfileById(req.params.id);

    return res.status(200).json({
      status: 'success',
      data: profile
    });

  } catch (err) {
    next(err);
  }
}

// GET /profiles
async function getProfiles(req, res, next) {
  try {
    const result = await service.listProfiles(req.query);

    return res.status(200).json({
      status: 'success',
      page: result.page,
      limit: result.limit,
      total: result.total,
      data: result.data
    });

  } catch (err) {
    next(err);
  }
}

// GET /profiles/search
async function searchProfiles(req, res, next) {
  try {
    const result = await service.searchProfiles(req.query);

    return res.status(200).json({
      status: 'success',
      page: result.page,
      limit: result.limit,
      total: result.total,
      data: result.data
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /profiles/:id
async function deleteProfile(req, res, next) {
  try {
    await service.deleteProfile(req.params.id);

    return res.status(204).send();

  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProfile,
  getProfile,
  getProfiles,
  searchProfiles,
  deleteProfile
};