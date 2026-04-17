// Convert age number into category
function getAgeGroup(age) {
  if (age <= 12) return 'child';      // kids
  if (age <= 19) return 'teenager';   // adolescents
  if (age <= 59) return 'adult';      // working population
  return 'senior';                   // elderly
}

module.exports = { getAgeGroup };