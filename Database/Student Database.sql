-- Drop the database if it exists (to start fresh)
DROP DATABASE IF EXISTS attendance_db;

-- Create the database
CREATE DATABASE attendance_db;

-- Use the newly created database
USE attendance_db;

-- Create the 'students' table
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    class VARCHAR(50)
);

-- Insert random student data into 'students' table
INSERT INTO students (name, class) VALUES 
('Anushka Diwakar Pawar', 'Class 1'),
('Shreya Subhash Patil', 'Class 1'),
('Sakshi Sunil Patil', 'Class 1'),
('Varsha Hiraman Pawar', 'Class 1'),
('Saurabh Dinesh Patil', 'Class 1'),
('Yukta Durgesh Pawar', 'Class 2'),
('Harshada Rohidas Patil', 'Class 2'),
('Vedika Kamlakar Shirude', 'Class 2'),
('Shweta Yogesh Talware', 'Class 3'),
('Anushka Nitin Patil', 'Class 3'),
('Ankita Sonawane', 'Class 1'),
('Arpita Chandratre', 'Class 1'),
('Madhura Badgujar', 'Class 2'),
('Priyanka Mahale', 'Class 2'),
('Bhavika Patil', 'Class 3');

INSERT INTO students (name, class) VALUES ('Student Name', 'Class 1');


-- Select all students from the 'students' table (just for confirmation)
SELECT * FROM students;

-- Create the 'attendance' table
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,  -- Foreign key reference to 'students'
    class VARCHAR(50),  -- The class of the student
    date DATE,  -- Attendance date
    status VARCHAR(20),  -- Attendance status (Present, Absent, Late, etc.)
    FOREIGN KEY (student_id) REFERENCES students(id) -- Ensure the student_id exists in 'students'
);

-- Insert random attendance data into 'attendance' table
INSERT INTO attendance (student_id, class, date, status) VALUES
(1, 'Class 1', '2024-10-01', 'Present'),
(2, 'Class 1', '2024-10-01', 'Absent'),
(3, 'Class 1', '2024-10-01', 'Present'),
(4, 'Class 1', '2024-10-01', 'Late'),
(5, 'Class 1', '2024-10-01', 'Present'),
(6, 'Class 2', '2024-10-01', 'Absent'),
(7, 'Class 2', '2024-10-02', 'Late'),
(8, 'Class 2', '2024-10-02', 'Present'),
(9, 'Class 3', '2024-10-02', 'Absent'),
(10, 'Class 3', '2024-10-02', 'Present');

INSERT INTO attendance (student_id, class, date, status) VALUES (1, 'Class 1', '2024-10-24', 'Present');
select * from students;
SELECT * FROM students WHERE class = 'Class 1';

-- Select all attendance records from the 'attendance' table
SELECT * FROM attendance;

-- Select student IDs and names from 'students' (for use in other queries)
SELECT id, name FROM students;

-- Select student IDs and names with aliases for frontend use
SELECT id AS student_id, name AS student_name FROM students;


drop table attendance;

SELECT s.name AS student_name, a.status, a.date
FROM attendance a
JOIN students s ON a.student_id = s.id
WHERE s.class = 'Class 1' 
AND a.date BETWEEN '2024-10-01' AND '2024-10-30'
ORDER BY a.date ASC;

DELETE FROM attendance WHERE student_id = 3; -- Delete attendance records
DELETE FROM students WHERE id = 26; -- Then delete the student

ALTER TABLE attendance
DROP FOREIGN KEY attendance_ibfk_1;

ALTER TABLE attendance
ADD CONSTRAINT attendance_ibfk_1 FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE;


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

SELECT * FROM users;


