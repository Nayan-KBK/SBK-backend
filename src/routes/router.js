// router.js
const express = require('express');
const router = express.Router();
const messageSchema = require('../db/messageSchema');
const AdminSchema = require('../db/AdminSchema');
const jwt = require('jsonwebtoken');




router.get('/',(req,res)=>{
  res.send("Welcome to SBK Backend . . . .")
})



// POST route to save a message
router.post('/submit-form', async (req, res) => {
  const { firstName, lastName, mobile, email, subject, message, pageUrl } = req.body;
  try {
    // console.log(firstName,lastName,mobile,email,subject,message)
    const newMessage = new messageSchema({
      firstName,
      lastName,
      mobile,
      email,
      subject,
      message,
      pageUrl

    });

    await newMessage.save();
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



router.delete('/data', async (req, res) => {
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
    const { email, password, } = req.body;

    // Create a new admin instance
    const admin = new AdminSchema({  email, password });

    // Save admin to the database
    await admin.save();
    res.status(201).send("Admin registered successfully");
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]; // Get the field causing the error
      return res.status(400).send(`${field} is already in use.`);
    }

    // Handle other errors
    res.status(400).send(error.message);
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
    res.send("Login successful");
  } catch (error) {
    res.status(400).send(error.message);
  }
});



module.exports = router;
