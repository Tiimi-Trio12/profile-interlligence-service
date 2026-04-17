// Validate external API responses
function validateExternalData(gender, age, country) {

  // Gender API must return valid gender + count > 0
  if (!gender.gender || gender.count === 0) {
    throw new Error('Genderize returned an invalid response');
  }

  // Age API must return valid age
  if (!age.age) {
    throw new Error('Agify returned an invalid response');
  }

  // Country API must have at least one country
  if (!country.country || country.country.length === 0) {
    throw new Error('Nationalize returned an invalid response');
  }
}

module.exports = { validateExternalData };