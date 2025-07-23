// Simple test script to verify API endpoints
const BASE_URL = 'https://wedding-planner-hjgegeadbnaqfkge.canadacentral-01.azurewebsites.net';

async function testAPI() {
  console.log('Testing API endpoints...');
  
  try {
    // Test basic API connectivity
    const testResponse = await fetch(`${BASE_URL}/api/test`);
    console.log('Test endpoint status:', testResponse.status);
    const testText = await testResponse.text();
    console.log('Test response text:', testText.substring(0, 200) + '...');
    
    if (testResponse.ok) {
      try {
        const testData = JSON.parse(testText);
        console.log('Test response parsed:', testData);
      } catch (e) {
        console.log('Could not parse test response as JSON');
      }
    }
    
    // Test registration
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: 'testuser' + Date.now(),
        password: 'testpass123',
        name: 'Test User',
        role: 'bride'
      })
    });
    
    console.log('Register endpoint status:', registerResponse.status);
    const registerText = await registerResponse.text();
    console.log('Register response text:', registerText.substring(0, 200) + '...');
    
    if (registerResponse.ok) {
      try {
        const registerData = JSON.parse(registerText);
        console.log('Register response parsed:', registerData);
      } catch (e) {
        console.log('Could not parse register response as JSON');
      }
    }
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI(); 