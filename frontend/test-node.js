console.log('Node.js test script is running!');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

// Test basic operations
const sum = 1 + 1;
console.log('1 + 1 =', sum);

// Test file system access
const fs = require('fs');
console.log('Current directory files:', fs.readdirSync('.'));
