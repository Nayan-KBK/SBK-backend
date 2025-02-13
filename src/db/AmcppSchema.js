const mongoose = require('mongoose');

const AmcppSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,

    },
    mobile: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address'],
    },
    message: {
        type: String,
        required: true,
    },
    service: {
        type: String,
        required: true, // To track the page (services, contact, home)
    },
    industry: {
        type: String,
        required: true, // To track the page (services, contact, home)
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Amcpppllc', AmcppSchema);
