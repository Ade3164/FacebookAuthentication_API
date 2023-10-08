const crypto = require('crypto');

// Generate a random 32-character hexadecimal string
const sessionSecret = crypto.randomBytes(32).toString('hex');

console.log(`Session Secret Key: ${sessionSecret}`);
