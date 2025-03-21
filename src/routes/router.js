// router.js
const express = require('express');
const router = express.Router();
const messageSchema = require('../db/messageSchema');
const AdminSchema = require('../db/AdminSchema');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const nodemailer = require("nodemailer");
const appointmentSchema = require('../db/appointmentSchema');
const AmcppSchema = require('../db/AmcppSchema');

require("dotenv").config();

// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });



const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});






router.get('/', (req, res) => {
  res.send("Welcome to SBK Backend . . . .")
})



// POST route to save a message
router.post('/submit-form', async (req, res) => {
  const { firstName, lastName, mobile, email, subject, message, pageUrl,page } = req.body;
  try {
    // console.log(firstName,lastName,mobile,email,subject,message)
    const newMessage = new messageSchema({
      firstName,
      lastName,
      mobile,
      email,
      subject,
      message,
      pageUrl,
      page

    });

    await newMessage.save();

    // Send email notification



    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: "contact@sbataxconsultants.com",
    //   cc: ["shivakrishna@equinoxitsol.com", "usitdallas@gmail.com"],
    //   subject: `New Inquiry Received by ${firstName} ${lastName} for SBA`,
    //   html: `
    //     <h3>New Inquiry Details:</h3>
    //     <p><strong>First Name:</strong> ${firstName}</p>
    //     <p><strong>Last Name:</strong> ${lastName}</p>
    //     <p><strong>Mobile:</strong> ${mobile}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Subject:</strong> ${subject}</p>
    //     <p><strong>Message:</strong> ${message}</p>
    //     <p><strong>Page URL:</strong> ${pageUrl}</p>
    //   `,
    // };




    // test mails

     const testmailOptions = {
      from: "nayandhongadi.kbk@gmail.com",
      to: "varshithakbk319@gmail.com",
      // cc: ["shivakrishna@equinoxitsol.com", "usitdallas@gmail.com"],
      subject: `Test Dev New Inquiry Received by ${firstName} ${lastName} from SBA ${page}page`,
      html: `

        <h3>Hello SBA Team </h3>
        <h3>New Inquiry Details:</h3>
        <p><strong>First Name:</strong> ${firstName}</p>
        <p><strong>Last Name:</strong> ${lastName}</p>
        <p><strong>Mobile:</strong> ${mobile}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Page URL:</strong> ${pageUrl}</p>
      `,
    };


    await transporter.sendMail(testmailOptions);
    res.status(201).send({ message: 'Message saved successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error saving message', error });
  }
});





// API to get all data
router.get('/get-all-data', async (req, res) => {
  try {
    const allData = await messageSchema.find();
    res.status(200).json(allData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

router.delete('/delete-data', async (req, res) => {
  try {
    const { ids } = req.body; // Expect an array of IDs for bulk delete or a single ID for single delete

    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: 'No IDs provided for deletion' });
    }

    // If single ID is passed as a string, convert it to an array
    const idArray = Array.isArray(ids) ? ids : [ids];

    // Check if documents exist for the given IDs
    const existingDocs = await messageSchema.find({ _id: { $in: idArray } });

    if (existingDocs.length === 0) {
      return res.status(404).json({ error: 'No documents found for the provided IDs' });
    }

    const result = await messageSchema.deleteMany({ _id: { $in: idArray } });

    res.status(200).json({
      message: `${result.deletedCount} item(s) deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete data', details: error.message });
  }
});



// Register Admin


router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and password are required.");
    }

    // Check if the email already exists
    const existingAdmin = await AdminSchema.findOne({ email });
    if (existingAdmin) {
      return res.status(400).send("Email is already in use.");
    }

    // Create a new admin instance
    const admin = new AdminSchema({ email, password, role });
    await admin.save();

    res.status(201).send("Admin registered successfully");
  } catch (error) {
    console.error("Error while registering admin:", error);

    if (error.code === 11000) {
      return res.status(400).send("Email is already in use.");
    }

    res.status(500).send("Internal server error.");
  }
});


// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email only
    const admin = await AdminSchema.findOne({ email });

    if (!admin) {
      return res.status(404).send("Admin not found");
    }

    // Compare passwords
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send("Invalid credentials");
    }

    // Send success response
    // res.send("Login successful");
    // res.status(200).json({message:"Login successful",role: role})
    console.log("admin--------------.>", admin)
    console.log("admin.role--------------.>", admin.role)
    res.status(200).json({
      message: "Login successful",
      role: admin.role, // Assuming `roles` is an array in the schema

    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});







router.post('/export-excel', async (req, res) => {
  try {
    const { section, range } = req.body;

    // Calculate the start date based on the selected range
    const now = new Date();
    let startDate;
    switch (range) {
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '15d':
        startDate = new Date(now - 15 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '3m':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '6m':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = null; // No date filter
    }

    // Build the query based on the section and date range
    const query = {};
    // if (section === 'all') {
    // } else if (section === 'services') {
    //   query.pageUrl = { $nin: ['home', 'contact-us'] }; 
    // } else {
    //   query.pageUrl = section; 
    // }


    if (section === 'all') {
      // Fetch all data
    } else if (section === 'contact') {
      query.page = 'contact-us';
    } else if (section === 'home') {
      query.page = 'home';
    } else if (section === 'landing') {
      query.page = 'landing-page';
    } else if (section === 'service') {
      query.page = 'service-page';
    } else {
      return res.status(400).send({ message: 'Invalid section specified' });
    }


 



    if (startDate) {
      query.submittedAt = { $gte: startDate }; // Date filter
    }

    // Fetch the filtered data
    const data = await messageSchema.find(query).lean();

    // Format the data for Excel
    const formattedData = data.map(item => ({
      FirstName: item.firstName,
      LastName: item.lastName,
      Mobile: item.mobile,
      Email: item.email,
      Subject: item.subject,
      Message: item.message,
      PageUrl: item.pageUrl,
      Page:item.page,
      SubmittedAt: item.submittedAt ? new Date(item.submittedAt).toLocaleString() : null,
    }));

    // Create the Excel workbook and worksheet in memory
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Messages');

    // Convert the workbook to a buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });




    // Send the buffer as a response
    res.setHeader('Content-Disposition', 'attachment; filename=messages.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error generating Excel file', error });
  }
});





// router.post('/export-excel', async (req, res) => {
//   try {
//     const { section, range } = req.body;

//     // Calculate the start date based on the selected range
//     const now = new Date();
//     let startDate;
//     switch (range) {
//       case '7d':
//         startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
//         break;
//       case '15d':
//         startDate = new Date(now - 15 * 24 * 60 * 60 * 1000);
//         break;
//       case '1m':
//         startDate = new Date(now.setMonth(now.getMonth() - 1));
//         break;
//       case '3m':
//         startDate = new Date(now.setMonth(now.getMonth() - 3));
//         break;
//       case '6m':
//         startDate = new Date(now.setMonth(now.getMonth() - 6));
//         break;
//       case '1y':
//         startDate = new Date(now.setFullYear(now.getFullYear() - 1));
//         break;
//       default:
//         startDate = null; // No date filter
//     }

//     // Build the query based on the section and date range
//     const query = {};
//     if (section === 'all') {
//       // Fetch all data
//     } else if (section === 'contact') {
//       query.page = 'contact';
//     } else if (section === 'home') {
//       query.page = 'home';
//     } else if (section === 'landing') {
//       query.page = 'landing';
//     } else if (section === 'service') {
//       query.page = 'service';
//     } else {
//       return res.status(400).send({ message: 'Invalid section specified' });
//     }

//     if (startDate) {
//       query.submittedAt = { $gte: startDate }; 
//     }

//     // Fetch the filtered data
//     const data = await messageSchema.find(query).lean();

//     // Format the data for Excel
//     const formattedData = data.map(item => ({
//       FirstName: item.firstName,
//       LastName: item.lastName,
//       Mobile: item.mobile,
//       Email: item.email,
//       Subject: item.subject,
//       Message: item.message,
//       Page: item.page,
//       SubmittedAt: item.submittedAt ? item.submittedAt.toISOString() : null,
//     }));

//     // Create the Excel workbook and worksheet in memory
//     const worksheet = XLSX.utils.json_to_sheet(formattedData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Messages');

//     // Convert the workbook to a buffer
//     const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

//     // Send the buffer as a response
//     res.setHeader('Content-Disposition', 'attachment; filename=messages.xlsx');
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.send(excelBuffer);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: 'Error generating Excel file', error });
//   }
// });










// POST route to save a message
router.post('/book-appointment', async (req, res) => {
  const { firstName, lastName, mobile, email, appointmentDate, message, appointmentTime, service } = req.body;
  try {
    // console.log(firstName,lastName,mobile,email,subject,message)
    const newMessage = new appointmentSchema({
      firstName,
      lastName,
      mobile,
      email,
      appointmentDate,
      message,
      appointmentTime,
      service

    });

    await newMessage.save();

    // Send email notification
    // const mailOptions = {
    //   from: process.env.EMAIL_USER, // Sender address
    //   to: "contact@sbataxconsultants.com",
    //   cc: ["shivakrishna@equinoxitsol.com", "usitdallas@gmail.com"],
    //   subject: `New Appointmetn Schedule by ${firstName}`,
    //   html: `
    //     <h3>New Inquiry Details:</h3>
    //     <p><strong>Name:</strong> ${firstName} ${lastName}</p>
    //     <p><strong>Mobile:</strong> ${mobile}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Message:</strong> ${message}</p>
    //     // <p><strong>Date:</strong> ${date}</p>
    //   `,
    // };


    // console.log(mailOptions)


    // await transporter.sendMail(mailOptions);

    res.status(201).send({ message: 'Message saved successfully' });
  } catch (error) {
    console.log('error--------->', error)
    res.status(500).send({ message: 'Error saving message', error });
  }
});




// API to get all appointments
router.get('/get-all-appointments', async (req, res) => {
  try {
    const allData = await appointmentSchema.find();
    res.status(200).json(allData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});















router.post('/submit-amcpp-form', async (req, res) => {
  const { firstName, lastName, mobile, email, service, message, industry } = req.body;
  try {
    const newMessage = new AmcppSchema({
      firstName,
      lastName,
      mobile,
      email,
      service,
      industry,
      message,

    });

    await newMessage.save();

    res.status(201).send({ message: 'Message saved successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error saving message', error });
  }
});





router.get('/get-amcpp-form', async (req, res) => {
  try {
    const allData = await AmcppSchema.find();
    res.status(200).json(allData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});













module.exports = router;
