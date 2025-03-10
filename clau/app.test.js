// Simple test for app.js using Node's built-in assert module
const assert = require('assert');
const { execSync } = require('child_process');

// Test that running the app produces output (we can't test exact output due to randomization)
console.log('Testing app.js output...');
try {
  const output = execSync('node app.js').toString().trim();
  
  // Test that output is not empty
  assert.ok(output.length > 0, 'Output should not be empty');
  
  // Test that colorful message part is included
  assert.ok(output.includes('Hello, Colorful World!'), 'Output should include "Hello, Colorful World!"');
  
  // Test that time is included
  assert.ok(output.includes('Current time:'), 'Output should include current time');
  
  // Test that ASCII art is included
  assert.ok(output.includes('*******'), 'Output should include ASCII art');
  
  console.log('✅ Tests passed!');
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}