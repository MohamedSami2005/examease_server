const mongoose = require('mongoose')

const StaffSchema = new mongoose.Schema({
   
    regNo : {
        type: String,
        required: true
    },
    dob : {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: '1'
    }
})


const StaffModel = mongoose.model("staff", StaffSchema)
module.exports = StaffModel
