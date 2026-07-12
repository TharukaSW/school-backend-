// Shared enumerations used across models and the frontend.

const CATEGORIES = ['Autism Spectrum', 'Intellectual', 'Physical/Sensory'];
const GRADES = Array.from({ length: 11 }, (_, i) => i + 1);

const ROLES = ['admin', 'teacher'];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const EVENT_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

// Teacher-awarded behaviour colours (logged over time).
const BEHAVIOR_COLORS = ['Green', 'Yellow', 'Red'];

// Academic colour band derived automatically from a student's average %.
const ACADEMIC_BANDS = [
  { color: 'Gold', min: 85, label: 'Excellent' },
  { color: 'Green', min: 70, label: 'Good' },
  { color: 'Blue', min: 50, label: 'Developing' },
  { color: 'Red', min: 0, label: 'Needs Support' },
];

module.exports = { CATEGORIES, GRADES, ROLES, DAYS, EVENT_PRIORITIES, BEHAVIOR_COLORS, ACADEMIC_BANDS };
