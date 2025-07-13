const fetch = require('node-fetch');

// Test the Netlify function locally
async function testNetlifyFunction() {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a test message from the migration script.',
    recaptchaToken: 'test-token' // This will fail verification, but tests the flow
  };

  try {
    console.log('Testing Netlify function...');
    console.log('Test data:', testData);

    const response = await fetch('http://localhost:8888/.netlify/functions/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response body:', result);

    if (response.ok) {
      console.log('✅ Function is working correctly!');
    } else {
      console.log('❌ Function returned an error (expected for test token)');
      console.log('This is normal for a test reCAPTCHA token.');
    }

  } catch (error) {
    console.error('❌ Error testing function:', error.message);
    console.log('Make sure Netlify CLI is running with: netlify dev');
  }
}

// Test CORS preflight
async function testCORS() {
  try {
    console.log('\nTesting CORS preflight...');
    
    const response = await fetch('http://localhost:8888/.netlify/functions/contact', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    console.log('CORS preflight status:', response.status);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    });

    if (response.status === 200) {
      console.log('✅ CORS is configured correctly!');
    } else {
      console.log('❌ CORS configuration issue');
    }

  } catch (error) {
    console.error('❌ Error testing CORS:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Netlify Function Setup\n');
  
  await testCORS();
  await testNetlifyFunction();
  
  console.log('\n📋 Next Steps:');
  console.log('1. Set up environment variables in Netlify dashboard');
  console.log('2. Deploy to Netlify');
  console.log('3. Test with real reCAPTCHA token');
  console.log('4. Deploy updated code to Netlify');
}

runTests(); 