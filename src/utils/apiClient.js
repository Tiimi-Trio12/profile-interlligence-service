const axios = require('axios');

// Call Genderize API
async function getGender(name) {
  const res = await axios.get(`https://api.genderize.io?name=${name}`);

  // Return raw API response
  return res.data;
}

// Call Agify API
async function getAge(name) {
  const res = await axios.get(`https://api.agify.io?name=${name}`);

  return res.data;
}

// Call Nationalize API
async function getCountry(name) {
  const res = await axios.get(`https://api.nationalize.io?name=${name}`);

  return res.data;
}

module.exports = {
  getGender,
  getAge,
  getCountry
};