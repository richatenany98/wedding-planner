// Local test to verify API routing
const BASE_URL = 'http://localhost:5000';

async function testLocalAPI() {
  console.log('Testing local API endpoints...');
  
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
    
  } catch (error) {
    console.error('Local API test failed:', error);
  }
}

testLocalAPI(); 