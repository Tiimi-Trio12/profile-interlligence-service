const { v7: uuidv7 } = require('uuid');

// Wrapper function for clarity and consistency
function generateId() {
  return uuidv7();
}

module.exports = { generateId };