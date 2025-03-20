const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
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
  subject:{
    type:String,
    required:true,
  },
  message:{
    type:String,
    required:true,
  },
  pageUrl: {
    type: String,
    required: true,  
  },
  page: {
    type: String,
    required: true, 
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);
