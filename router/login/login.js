const express = require('express');
const router = express.Router();
const StudentModel = require('../../models/student')
const StaffModel = require('../../models/staff')

router.post('/login', async (req, res) => {
    const { regNo, password } = req.body;
    console.log(regNo, password);

    try {
        const stud = await StudentModel.findOne({ regNo: regNo });
        const staff = await StaffModel.findOne({regNo: regNo});
        if (stud) {
            console.log("Submitted password:", password);
            console.log("Stored password:", stud.dob);

            if (password === stud.dob) {
                console.log("Password matches");
                return res.json({ status: "exist", regNo: stud.regNo, });
            } else {
                return res.json({ status: "wrong password" });
            }
        }else if(staff){
            console.log("Submitted password:", password);
            console.log("Stored password:", staff.dob);

            if (password === staff.dob) {
                console.log("Password matches");
                return res.json({ status: "exist", regNo: staff.regNo, role: staff.role});
            } else {
                return res.json({ status: "wrong password" });
            }
        }
        else {
            return res.json({ status: 'not exist' });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.put('/staffmang/:id', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    // const hashedPassword = bcrypt.hashSync(password, 10);
    // console.log(hashedPassword)

    StaffModel.findByIdAndUpdate(id, {password: password }, { new: true })
        .then(user => res.json(user))
        .catch(err => res.json(err));
});

router.get('/staffmang', async (req, res) => {
    try{
        const data = await StaffModel.find();
        console.log(data)
        res.json(data)
    }catch(err){
        console.log(err)
        res.status(500).send('An error occurred while processing the request.');
    }
})

module.exports = router;