

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // to handle JSON data in requests

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // your MySQL username
  password: 'Anushka@2004', // your MySQL password
  database: 'attendance_db', // your database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.log('Database connection failed:', err);
    return;
  }
  console.log('Connected to the database');
});

// Fetch all students
app.get('/students', (req, res) => {
  const query = 'SELECT id AS student_id, name AS student_name, class FROM students'; // Fetch all relevant fields
  db.query(query, (err, results) => {
    if (err) {
      console.log('Error fetching students:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Post attendance
app.post('/attendance', (req, res) => {
  const { class: studentClass, date, attendance } = req.body;

  // Prepare attendance data for insertion
  const attendanceValues = Object.entries(attendance).map(([studentId, status]) => [
    studentId,
    studentClass,
    date,
    status,
  ]);

  const query = 'INSERT INTO attendance (student_id, class, date, status) VALUES ?';

  db.query(query, [attendanceValues], (err) => {
    if (err) {
      console.error('Error submitting attendance:', err);
      res.status(500).json({ error: 'Failed to submit attendance' });
    } else {
      res.status(200).json({ message: 'Attendance submitted successfully' });
    }
  });
});

// // Start the server
// const PORT = 5050;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
