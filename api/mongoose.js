const mongoose = require('mongoose');

// MongoDB connection URL
const uri = process.env.MONGODB_URI; // Replace with your MongoDB URL

// Create a connection to the MongoDB database
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Get the default connection
const db = mongoose.connection;

// Event handlers for database connection
db.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Export the Mongoose instance to be used in your application
module.exports = mongoose;
