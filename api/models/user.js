// models/user.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  facebookId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  // Add more fields here as needed
});

const User = mongoose.model('User', userSchema);

module.exports = User;
