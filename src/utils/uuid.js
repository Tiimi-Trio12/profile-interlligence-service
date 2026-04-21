const { v7: uuidv7 } = require('uuid');

// Wrapper function for clarity and consistency
function generateId() {
  return uuidv7();
}

function isUuidV7(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

module.exports = { generateId, isUuidV7 };