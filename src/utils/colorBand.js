const { ACADEMIC_BANDS } = require('../config/constants');

// Returns the academic colour band for a given average percentage.
function academicBand(average) {
  if (average == null || isNaN(average)) return { color: 'Grey', label: 'No marks', min: null };
  const band = ACADEMIC_BANDS.find((b) => average >= b.min);
  return band || ACADEMIC_BANDS[ACADEMIC_BANDS.length - 1];
}

module.exports = { academicBand };
