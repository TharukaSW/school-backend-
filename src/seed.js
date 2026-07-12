/* Seeds the database with demo data.
   Run with: npm run seed
   WARNING: this clears existing collections first. */
require('dotenv').config();
const connectDB = require('./config/db');
const mongoose = require('mongoose');

const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Subject = require('./models/Subject');
const Sport = require('./models/Sport');
const Event = require('./models/Event');
const Timetable = require('./models/Timetable');
const Mark = require('./models/Mark');
const BehaviorColor = require('./models/BehaviorColor');
const { CATEGORIES, DAYS } = require('./config/constants');

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function yearsAgo(n) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d;
}
const pick = (arr, i) => arr[i % arr.length];

async function run() {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Teacher.deleteMany({}),
    Student.deleteMany({}),
    Subject.deleteMany({}),
    Sport.deleteMany({}),
    Event.deleteMany({}),
    Timetable.deleteMany({}),
    Mark.deleteMany({}),
    BehaviorColor.deleteMany({}),
  ]);

  // --- Subjects ---
  console.log('Creating subjects...');
  const subjects = await Subject.create([
    { name: 'Functional Literacy', code: 'LIT101', maxScore: 100, level: 'Primary', categories: CATEGORIES },
    { name: 'Functional Numeracy', code: 'NUM101', maxScore: 100, level: 'Primary', categories: CATEGORIES },
    { name: 'Communication Skills', code: 'COM101', maxScore: 50, level: 'Primary', categories: ['Autism Spectrum', 'Intellectual'] },
    { name: 'Life Skills', code: 'LIFE101', maxScore: 100, level: 'Primary', categories: CATEGORIES },
    { name: 'Sensory & Motor Skills', code: 'MOT101', maxScore: 50, level: 'Primary', categories: ['Physical/Sensory'] },
    { name: 'Art & Music Therapy', code: 'ART101', maxScore: 50, level: 'Primary', categories: CATEGORIES },
  ]);

  // --- Teachers (+ linked user accounts) ---
  console.log('Creating teachers...');
  const teacherSeed = [
    { firstName: 'Sarah', lastName: 'Johnson', spec: ['Autism Spectrum'], subs: [0, 2] },
    { firstName: 'Michael', lastName: 'Chen', spec: ['Intellectual'], subs: [1, 3] },
    { firstName: 'Priya', lastName: 'Patel', spec: ['Physical/Sensory'], subs: [4, 5] },
    { firstName: 'David', lastName: 'Okoro', spec: ['Autism Spectrum', 'Intellectual'], subs: [0, 1] },
    { firstName: 'Emma', lastName: 'Williams', spec: ['Physical/Sensory'], subs: [3, 5] },
  ];

  const teachers = [];
  for (let i = 0; i < teacherSeed.length; i++) {
    const t = teacherSeed[i];
    const teacher = await Teacher.create({
      employeeId: `EMP${(1001 + i).toString()}`,
      firstName: t.firstName,
      lastName: t.lastName,
      email: `${t.firstName.toLowerCase()}.${t.lastName.toLowerCase()}@school.edu`,
      phone: `+1-555-01${(10 + i).toString()}`,
      gender: i % 2 === 0 ? 'Female' : 'Male',
      dob: yearsAgo(30 + i),
      qualification: 'M.Ed Special Education',
      specializations: t.spec,
      subjects: t.subs.map((s) => subjects[s]._id),
      joinDate: yearsAgo(3),
      status: 'Active',
    });
    teachers.push(teacher);

    // Linked teacher login (password: teacher123)
    await User.create({
      name: `${t.firstName} ${t.lastName}`,
      email: teacher.email,
      password: 'teacher123',
      role: 'teacher',
      teacher: teacher._id,
    });
  }

  // --- Admin ---
  console.log('Creating admin...');
  await User.create({ name: 'School Admin', email: 'admin@school.edu', password: 'admin123', role: 'admin' });

  // --- Students (+ medical) ---
  console.log('Creating students...');
  const firstNames = ['Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Mia', 'Lucas', 'Sophia', 'Mason', 'Isabella', 'Leo', 'Zoe'];
  const lastNames = ['Smith', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris'];
  const conditionsByCat = {
    'Autism Spectrum': ['ASD Level 2', 'Sensory processing'],
    Intellectual: ['Down syndrome', 'Global developmental delay'],
    'Physical/Sensory': ['Cerebral palsy', 'Hearing impairment'],
  };

  const students = [];
  for (let i = 0; i < 12; i++) {
    const category = pick(CATEGORIES, i);
    const student = await Student.create({
      admissionNumber: `ADM${(2024001 + i).toString()}`,
      firstName: pick(firstNames, i),
      lastName: pick(lastNames, i),
      dob: yearsAgo(7 + (i % 6)),
      gender: i % 2 === 0 ? 'Male' : 'Female',
      category,
      grade: (i % 11) + 1,
      residence: i % 3 === 0 ? 'Hostel' : 'Home',
      address: `${100 + i} Maple Street`,
      enrollmentDate: yearsAgo(1),
      status: 'Active',
      guardian: {
        name: `${pick(lastNames, i)} Family`,
        relation: 'Parent',
        phone: `+1-555-02${(10 + i).toString()}`,
        email: `guardian${i}@example.com`,
      },
      medical: {
        bloodGroup: pick(['A+', 'B+', 'O+', 'AB+', 'O-'], i),
        allergies: i % 3 === 0 ? ['Peanuts'] : [],
        conditions: conditionsByCat[category],
        medications:
          i % 4 === 0 ? [{ name: 'Melatonin', dosage: '3mg', schedule: 'Nightly' }] : [],
        primaryDoctor: 'Dr. Alice Reed',
        doctorPhone: '+1-555-0900',
        emergencyContact: { name: `${pick(firstNames, i + 1)} ${pick(lastNames, i)}`, phone: `+1-555-03${(10 + i)}`, relation: 'Parent' },
        notes: 'Follows an individualised education plan (IEP).',
        records: [
          { date: daysFromNow(-40), type: 'Checkup', title: 'Annual physical', description: 'No concerns.', recordedBy: 'Nurse Kelly' },
          { date: daysFromNow(-10), type: 'Therapy', title: 'Occupational therapy session', description: 'Good progress on fine motor skills.', recordedBy: 'Nurse Kelly' },
        ],
      },
    });
    students.push(student);
  }

  // --- Sports ---
  console.log('Creating sports...');
  await Sport.create([
    { name: 'Adaptive Swimming', description: 'Hydrotherapy and swimming', coach: teachers[2]._id, schedule: 'Tue & Thu 10:00', location: 'Pool', adaptive: true },
    { name: 'Boccia', description: 'Precision ball sport', coach: teachers[4]._id, schedule: 'Wed 11:00', location: 'Sports Hall', adaptive: true },
    { name: 'Sensory Yoga', description: 'Calming movement', coach: teachers[0]._id, schedule: 'Fri 09:00', location: 'Studio', adaptive: true },
  ]);

  // --- Events (with priority) ---
  console.log('Creating events...');
  await Event.create([
    { title: 'Parent-Teacher IEP Meeting', description: 'Termly review of individual plans', date: daysFromNow(5), location: 'Main Hall', type: 'Meeting', priority: 'High', organizer: teachers[0]._id },
    { title: 'Sports & Fun Day', description: 'Inclusive sports day', date: daysFromNow(14), location: 'Playground', type: 'Sports', priority: 'Medium', organizer: teachers[2]._id },
    { title: 'Fire Safety Drill', description: 'Mandatory evacuation drill', date: daysFromNow(2), location: 'Whole School', type: 'Other', priority: 'Critical', organizer: teachers[1]._id },
    { title: 'Art Exhibition', description: 'Student artwork showcase', date: daysFromNow(21), location: 'Gallery', type: 'Cultural', priority: 'Low', organizer: teachers[4]._id },
    { title: 'Sensory Storytelling', description: 'Interactive session', date: daysFromNow(-3), location: 'Library', type: 'Academic', priority: 'Low', organizer: teachers[3]._id },
  ]);

  // --- Timetable (per grade) ---
  console.log('Creating timetables...');
  const slots = [
    { start: '09:00', end: '09:45' },
    { start: '09:45', end: '10:30' },
    { start: '10:30', end: '10:45', activity: 'Sensory Break' },
    { start: '10:45', end: '11:30' },
    { start: '11:30', end: '12:15' },
    { start: '13:00', end: '13:45', activity: 'Life Skills / Sports' },
  ];
  const ttDocs = [];
  const grades = Array.from({ length: 11 }, (_, i) => i + 1);
  grades.forEach((grade) => {
    DAYS.forEach((day, di) => {
      slots.forEach((slot, si) => {
        const doc = {
          grade,
          day,
          startTime: slot.start,
          endTime: slot.end,
          room: `Room G${grade}-${si + 1}`,
        };
        if (slot.activity) {
          doc.activity = slot.activity;
        } else {
          doc.subject = pick(subjects, di + si)._id;
          doc.teacher = teachers[(grade + si) % teachers.length]._id;
        }
        ttDocs.push(doc);
      });
    });
  });
  await Timetable.create(ttDocs);

  // --- Marks ---
  console.log('Creating marks...');
  const markDocs = [];
  const terms = ['Term 1', 'Term 2'];
  students.forEach((student, sIdx) => {
    subjects.forEach((subject, subIdx) => {
      // Only assign subjects relevant to the student's category (or universal).
      if (subject.categories.length && !subject.categories.includes(student.category)) return;
      terms.forEach((term) => {
        const base = 45 + ((sIdx * 7 + subIdx * 5) % 50); // spread 45-95
        markDocs.push({
          student: student._id,
          subject: subject._id,
          term,
          level: 'Primary',
          score: Math.min(subject.maxScore, Math.round((base / 100) * subject.maxScore)),
          maxScore: subject.maxScore,
          date: daysFromNow(-30),
        });
      });
    });
  });
  await Mark.create(markDocs);

  // --- Behaviour colours ---
  console.log('Creating behaviour colours...');
  const colors = ['Green', 'Green', 'Yellow', 'Green', 'Red', 'Yellow', 'Green'];
  const notes = ['Great focus today', 'Helped a classmate', 'Needed reminders', 'Calm and engaged', 'Difficult morning', 'Improving', 'Excellent effort'];
  const behaviorDocs = [];
  students.forEach((student, sIdx) => {
    for (let k = 0; k < 5; k++) {
      behaviorDocs.push({
        student: student._id,
        color: pick(colors, sIdx + k),
        date: daysFromNow(-(k * 3 + 1)),
        note: pick(notes, sIdx + k),
      });
    }
  });
  await BehaviorColor.create(behaviorDocs);

  console.log('\n✅ Seed complete!');
  console.log('---------------------------------------');
  console.log('Admin login:   admin@school.edu / admin123');
  console.log('Teacher login: sarah.johnson@school.edu / teacher123');
  console.log('---------------------------------------');
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
