const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const StudentModel = require('../../models/student')

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    // Read the uploaded Excel file
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Function to convert Excel date to JavaScript Date
    const excelDateToJSDate = (excelDate) => {
      // Check if it's a valid Excel date number
      if (typeof excelDate === 'number') {
        return new Date((excelDate - 25569) * 86400 * 1000); // Convert Excel date to JS date
      }
      return new Date(excelDate); // In case it's already a date string
    };

    // Process the data
    const studentData = jsonData.map((row) => ({
      regNo: row['REGNO'],
      dob: row['DOB'],
      course_code: row['COURSE CODE'],
      link: row['LINK'],
      doe: excelDateToJSDate(row['DOE']),  // Use the conversion function
      session: row['Session'],
    }));

    // Loop through each student data and update or insert
    for (const student of studentData) {
      const { regNo, course_code } = student;

      // Find and update existing record, or insert if not found
      await StudentModel.findOneAndUpdate(
        { regNo, course_code },  // Condition: matching regNo and course_code
        { $set: student },        // Update fields with new data
        { upsert: true }          // If not found, insert a new record
      );
    }

    res.status(200).send('Data successfully uploaded and stored in the database.');
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('An error occurred while processing the file.');
  }
});

  module.exports = router;