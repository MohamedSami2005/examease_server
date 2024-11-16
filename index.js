require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
// const path = require("path");
const Student = require('./router/login/login')
const Uploads = require('./router/fileUpload/fileupload')
const Controls = require('./router/controls/controls')
const Exam =  require('./router/exam/exam')
// const bcrypt = require('bcryptjs');

const app = express()
console.log("CORS allowed origin:", process.env.FRONTEND_URL);
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
}))

app.use(express.json())
app.use('/api', Student);
app.use('/api', Uploads);
app.use('/api', Controls);
app.use('/api', Exam)

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});


const PORT = process.env.PORT || 3007;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});