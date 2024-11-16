const express = require('express');
const router = express.Router();
const moment = require('moment'); 
const StudentModel = require('../../models/student')

// router.get('/controls', async (req, res) => {
//     try {
//         const data = await StudentModel.find();

//         const uniqueData = data.filter((item, index, self) =>
//             index === self.findIndex((t) => t.course_code === item.course_code)
//         );

//         const courseCodeCounts = await StudentModel.aggregate([
//             { $group: { _id: "$course_code", count: { $sum: 1 } } }
//         ]);

//         const doeCounts = await StudentModel.aggregate([
//             { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$doe" } }, count: { $sum: 1 } } }
//         ]);

//         res.json({uniqueData,  
//             courseCodeCounts,
//             doeCounts,});

//     } catch (error) {
//         console.error('Error fetching data:', error);
//         res.status(500).send('An error occurred while processing the file.');
//     }
//   });
router.get('/students', async (req, res) => {
    try{
        const data = await StudentModel.find();
        console.log(data)
        res.json(data)
    }catch(err){
        console.log(err)
        res.status(500).send('An error occurred while processing the request.');
    }
})
router.get('/controls', async (req, res) => {
    try {
        // First, get all data from the collection
        const data = await StudentModel.find();

        // Filter to get unique course_codes
        const uniqueData = data.filter((item, index, self) =>
            index === self.findIndex((t) => t.course_code === item.course_code)
        );

        const results = await Promise.all(
            uniqueData.map(async (data) => {
               
                const count = await StudentModel.countDocuments({ course_code: data.course_code });
                return {
                    course_code: data.course_code,
                    count: count,
                    doe: data.doe,
                    session: data.session,  
                };
            })
        );
        console.log(results)
        res.json({uniqueData, results});
        
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('An error occurred while processing the request.');
    }
})
router.get('/dash', async (req, res) => {
    try {
        // First, get all data from the collection
        const data = await StudentModel.find();

        // Filter to get unique combinations of course_code and doe
        const uniqueData = data.filter((item, index, self) => 
            index === self.findIndex((t) => t.course_code === item.course_code && t.doe === item.doe)
        );

        // Calculate count per unique combination of course_code and doe
        const results = await Promise.all(
            uniqueData.map(async (uniqueItem) => {
                const count = await StudentModel.countDocuments({
                    course_code: uniqueItem.course_code,
                    doe: uniqueItem.doe
                });
                return {
                    course_code: uniqueItem.course_code,
                    doe: uniqueItem.doe,
                    count: count,
                    session: uniqueItem.session,  
                };
            })
        );

        console.log(results);
        res.json({ uniqueData, results });

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('An error occurred while processing the request.');
    }
});

  router.put('/controls/:courseCode', async (req, res) => {
    const { courseCode } = req.params;
    const { active } = req.body;
    console.log('courseCode',courseCode ,'active', active)
    try {
        // Find all students with the same course_code
        const control = await StudentModel.find({ course_code: courseCode });

        if (control.length === 0) {
            // If no documents found
            return res.status(404).json({ message: 'Course not found' });
        }

        // Update all documents with the same course_code
        await StudentModel.updateMany({ course_code: courseCode }, { $set: { active: active } });

        // Send a success response
        res.status(200).json({ message: 'Status updated successfully', updated: control.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/controls/update/:courseCode', async (req, res) => {
    const { courseCode } = req.params;  // Extract courseCode from URL parameter
    const { active, link, doe, session } = req.body;  // Extract fields to update

    try {
        // Update all courses that match the course_code
        const result = await StudentModel.updateMany(
            { course_code: courseCode },  // Condition: match the course_code
            {
                $set: {   // Set the fields to update
                    link: link !== undefined ? link : undefined,
                    doe: doe !== undefined ? new Date(doe) : undefined,  // Ensure date is in correct format
                    session: session !== undefined ? session : undefined,
                    active: active !== undefined ? active : undefined,
                }
            }
        );

        // If no records are modified, return an error
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'No courses found with the provided course code' });
        }

        // Respond with success message
        res.status(200).json({ message: 'Courses updated successfully', updatedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error updating courses:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

router.delete('/controls/delete/:courseCode', async (req, res) => {
    try {
        const { courseCode } = req.params;  // Correctly get courseCode from URL params
    
        // Find all students with the given course_code
        const course = await StudentModel.find({ course_code: courseCode });
    
        if (course && course.length > 0) {
          // Delete all students with the matching course_code
          const result = await StudentModel.deleteMany({ course_code: courseCode });
    
          res.status(200).json({
            message: 'Courses deleted successfully',
            deletedCount: result.deletedCount,  // Correctly return the number of deleted documents
          });
        } else {
          res.status(404).json({ message: 'No students found with the given course code.' });
        }
      } catch (error) {
        console.error('Error deleting courses:', error);
        res.status(500).json({ message: 'An error occurred while deleting the courses.' });
      }
})


//timer update
router.put('/controls/update-timer/:courseCode', async (req, res) => {
    const { courseCode } = req.params;
    const { timer } = req.body;
    console.log("timer", timer);  // Log the received timer value for debugging
  
    // Ensure timer is a positive number (e.g., in minutes or milliseconds)
    if (typeof timer !== 'number' || timer <= 0) {
      return res.status(400).json({ message: 'Invalid timer value. It should be a positive number.' });
    }
  
    try {
      // Get the current time in IST (India Standard Time)
      const currentTimeIST = new Date();  // Local time (IST or wherever your server is)
  
      const IST_OFFSET = 5.5 * 60 * 60 * 1000;  // 5 hours 30 minutes in milliseconds
      const currentTime = new Date(currentTimeIST.getTime() + IST_OFFSET); // Adjust local time to IST
      
      console.log("currentTime (IST):", currentTime);  // Log current time in IST
  
      // Calculate the future timestamp by adding the timer (in minutes) to the current date (in IST)
      let timerExpiration;
  
      if (timer) {  // If the timer is in milliseconds
        timerExpiration = new Date(currentTime.getTime() + timer);  
      }

      console.log("Calculated expiration time (IST):", timerExpiration);  
  
      const result = await StudentModel.updateMany(
        { course_code: courseCode },
        { $set: { timer: timerExpiration } }
      );
  
      // Check if any documents were modified
      if (result.nModified === 0) {
        return res.status(404).json({ message: 'No courses found to update' });
      }
  
      res.status(200).json({
        message: 'Timer updated successfully for matched courses',
        updatedCount: result.nModified,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating timer. Please try again.' });
    }
  });
  
module.exports = router;