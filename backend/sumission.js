const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const xlsx = require('xlsx');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/submit', (req, res) => {
    const { firstName, middleName, lastName, gender, email, studentId, classList } = req.body;

    // Save data to Excel
    const filePath = 'students.xlsx';
    let workbook;
    if (fs.existsSync(filePath)) {
        workbook = xlsx.readFile(filePath);
    } else {
        workbook = xlsx.utils.book_new();
    }
    const worksheet = workbook.Sheets['Sheet1'] || xlsx.utils.aoa_to_sheet([['First Name', 'Middle Name', 'Last Name', 'Gender', 'Email', 'Student ID', 'Class List']]);
    xlsx.utils.sheet_add_aoa(worksheet, [[firstName, middleName, lastName, gender, email, studentId, classList]], { origin: -1 });
    workbook.Sheets['Sheet1'] = worksheet;
    xlsx.writeFile(workbook, filePath);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password'
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ message: 'Error sending OTP' });
        }
        res.json({ message: 'Form submitted successfully! OTP sent to email.' });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
