const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: { 
    type: String, 
    required: true,

  },
  mobile:{
    type:String,
    required: true,

  },
  email: {
    type: String,
    required: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address'],
  },
  message:{
    type:String,
    required:true,
  },
  appointmentDate:{
    type:Date,
    // requestIdleCallback:true
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  appointmentTime : {
    type:String,
    required:true,
  },
  service:{
    type:String,
    required:true,
  },
});

module.exports = mongoose.model('appointment', appointmentSchema);
