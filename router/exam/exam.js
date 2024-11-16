const express = require('express');
const router = express.Router();
const StudentModel = require('../../models/student')

router.get('/exam/:regNo', async (req, res) => {
    const {regNo} = req.params;
    try {
        const data = await StudentModel.find({regNo: regNo});
        console.log(data)
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('An error occurred while processing the file.');
    }
  });

  module.exports = router;