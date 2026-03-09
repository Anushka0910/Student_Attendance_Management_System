const express = require('express');
 mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

const authenticateToken = require('./middleware/authenticateToken');


// JWT secret key (change it to a secure one in production)
const SECRET_KEY = 'your-secret-key';


const app = express();
const PORT = process.env.PORT ||5050;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',    
     password: 'Anushka@2004', // Replace with your MySQL password
    database: 'attendance_db' // Replace with your actual database name
});


// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('MySQL connected...');
});

// CRUD Operations

// 1. Create - Add a new student attendance record
app.post('/attendance', (req, res) => {
    const { class: studentClass, date, attendance } = req.body;

    // Prepare attendance data for insertion
    const attendanceValues = Object.entries(attendance).map(([studentId, status]) => [
        studentId,      // student_id
        studentClass,   // class
        date,           // date
        status          // status
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

app.get('/students/:class', (req, res) => {
  const studentClass = req.params.class;

  console.log(`Fetching students for class: ${studentClass}`);  // Log the class

  const query = 'SELECT id, name FROM students WHERE class = ?';
  db.query(query, [studentClass], (err, results) => {
      if (err) {
          console.error('Error fetching students by class:', err);
          res.status(500).json({ error: 'Failed to fetch students' });
      } else {
          console.log('Fetched students:', results);  // Log the fetched students
          res.status(200).json(results);
      }
  });
});


// 3. Update - Update an existing attendance record
app.put('/attendance/:id', (req, res) => {
    const { id } = req.params;
    const { attendance_status } = req.body;
    const sql = 'UPDATE attendance SET status = ? WHERE student_id = ?'; // Corrected the column name to 'status'
    
    db.query(sql, [attendance_status, id], (err, result) => {
        if (err) {
            console.error('Error updating record:', err);
            return res.status(500).json(err);
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Record not found' });
        res.status(200).json({ message: 'Attendance record updated successfully' });
    });
});

// 4. Delete - Delete an attendance record
app.delete('/attendance/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM attendance WHERE student_id = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting record:', err);
            return res.status(500).json(err);
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Record not found' });
        res.status(200).json({ message: 'Attendance record deleted successfully' });
    });
});

app.post('/students', (req, res) => {
  const { id, name, class: studentClass } = req.body;

  if (!id || !name || !studentClass) {
      return res.status(400).json({ error: 'Please provide all required fields: id, name, class' });
  }

  const query = 'INSERT INTO students (id, name, class) VALUES (?, ?, ?)';

  db.query(query, [id, name, studentClass], (err, result) => {
      if (err) {
          console.error('Error inserting student:', err);
          return res.status(500).json({ error: 'Failed to add student' });
      }

      console.log(`Inserted student: ${name} into class ${studentClass}`);

      const getStudentsQuery = 'SELECT id, name FROM students WHERE class = ?';
      db.query(getStudentsQuery, [studentClass], (err, rows) => {
          if (err) {
              console.error('Error fetching students:', err);
              return res.status(500).json({ error: 'Failed to fetch students' });
          }

          console.log('Fetched students:', rows);  // Log fetched students

          res.status(201).json({ message: 'Student added successfully', students: rows });
      });
  });
});




app.delete('/students/:id', (req, res) => {
  const studentId = req.params.id;

  // Query to delete attendance records first
  const deleteAttendanceQuery = 'DELETE FROM attendance WHERE student_id = ?';

  // Query to delete the student
  const deleteStudentQuery = 'DELETE FROM students WHERE id = ?';

  // Execute the queries sequentially
  db.query(deleteAttendanceQuery, [studentId], (err, result) => {
      if (err) {
          console.error('Error deleting attendance records:', err);
          return res.status(500).json({ error: 'Failed to delete attendance records' });
      }

      // Now delete the student
      db.query(deleteStudentQuery, [studentId], (err, result) => {
          if (err) {
              console.error('Error deleting student:', err);
              return res.status(500).json({ error: 'Failed to delete student' });
          }

          if (result.affectedRows > 0) {
              res.status(200).json({ message: 'Student deleted successfully' });
          } else {
              res.status(404).json({ error: 'Student not found' });
          }
      });
  });
});



  // Sign up route
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
  
    // Check if the user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
        console.error('Error checking user existence:', err);
        return res.status(500).json({ error: 'Server error' });
      }
  
      if (results.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert new user into the database
      const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      db.query(insertUserQuery, [username, email, hashedPassword], (err) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ error: 'Failed to register user' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  });



  // User login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
      if (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Login failed' });
      } else if (results.length > 0) {
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });
  });



// API to generate attendance report
app.post('/api/attendance-report', (req, res) => {
  const { class: className, fromDate, toDate } = req.body;

  // Validate inputs
  if (!className || !fromDate || !toDate) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Query to fetch attendance records for the specified class and date range
  const query = `
      SELECT s.name AS student_name, a.date, a.status 
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.class = ? AND a.date BETWEEN ? AND ?
      ORDER BY a.date;
  `;

  db.query(query, [className, fromDate, toDate], (err, results) => {
      if (err) {
          console.error('Error fetching attendance report:', err);
          return res.status(500).json({ success: false, message: 'Database query error.' });
      }

      if (results.length === 0) {
          return res.status(404).json({ success: false, message: 'No records found.' });
      }

      res.status(200).json({ success: true, data: results });
  });
});



// Registration Endpoint
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;

  // Hash password before storing
  bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
          return res.status(500).json({ error: 'Error hashing password' });
      }

      const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      db.query(query, [username, email, hashedPassword], (error, result) => {
          if (error) {
              return res.status(500).json({ error: 'Error registering user' });
          }
          res.status(201).json({ message: 'User registered successfully' });
      });
  });
});





app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
  
    // Check if email or password is missing
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
  
    const query = 'SELECT id, username, email, password FROM users WHERE email = ?';
  
    db.query(query, [email], (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Database query failed' });
      }
  
      if (results.length === 0) {
        console.log(`User with email ${email} not found`);
        return res.status(404).json({ error: 'User not found' });
      }
  
      const user = results[0];
  
      // Log user details to check which user was found
      console.log(`User found: ${user.username}, ${user.email}`);
  
      // Compare the hashed password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Password comparison error:', err);
          return res.status(500).json({ error: 'Password comparison failed' });
        }
        if (!isMatch) {
          console.log('Invalid password for user:', user.email);
          return res.status(401).json({ error: 'Invalid password' });
        }
  
        // Generate JWT token
        const token = jwt.sign({ userId: user.id, email: user.email, username: user.username }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
  
        // Log the generated token
        console.log('Generated token:', token);
  
        // Respond with the token and user details
        res.status(200).json({ message: 'Login successful', token, user: { username: user.username, email: user.email } });
      });
    });
  });


  app.get('/api/profile', authenticateToken, (req, res) => {
    const userId = req.user.userId;  // Extract userId from the decoded JWT token
  
    const query = 'SELECT id, username, email FROM users WHERE id = ?';
    db.query(query, [userId], (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Database query failed' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const user = results[0];
      res.status(200).json({
        message: 'Profile retrieved successfully',
        profile: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    });
  });
  
  
  


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
