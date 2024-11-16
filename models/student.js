const mongoose = require('mongoose')

const StudentSchema = new mongoose.Schema({
   
    regNo : {
        type: String,
        required: true
    },
    dob : {
        type: String,
        required: true
    },
    course_code: String, 
    link : String,
    doe : Date,
    session : String,
    active: {
        type: String,
        default: '0'
    },
    timer: {
        type: Date,  
        // required: true,
      },
})


const StudentModel = mongoose.model("student", StudentSchema)
module.exports = StudentModel
