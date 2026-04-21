const express = require('express');
const controller = require('../controllers/profile.controller');

const router = express.Router();

// Map endpoints to controller functions
router.post('/profiles', controller.createProfile); // Create new profile
router.get('/profiles/search', controller.searchProfiles); // Natural language profile search
router.get('/profiles', controller.getProfiles); // Get all profiles with optional filters
router.get('/profiles/:id', controller.getProfile); // Get single profile by ID
router.delete('/profiles/:id', controller.deleteProfile);// Delete profile by ID

module.exports = router;