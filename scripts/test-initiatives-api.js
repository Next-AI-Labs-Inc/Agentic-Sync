const axios = require('axios');

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3045';
const API_KEY = process.env.NEXT_PUBLIC_TASK_API_KEY || 'dev-api-key';

// Create axios instance with authentication
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  // Add timeout to avoid hanging
  timeout: 10000
});

// Test function to get initiatives
async function testGetInitiatives() {
  try {
    console.log(`Attempting to fetch initiatives from ${API_URL}/api/initiatives`);
    console.log('Using headers:', apiClient.defaults.headers);
    
    const response = await apiClient.get('/api/initiatives');
    
    console.log('Success! Initiatives retrieved:', response.data.length);
    console.log('First few initiatives:');
    
    // Show the first 2 initiatives
    response.data.slice(0, 2).forEach((initiative, index) => {
      console.log(`\nInitiative ${index + 1}:`);
      console.log(`  ID: ${initiative.id || initiative._id}`);
      console.log(`  Name: ${initiative.name}`);
      console.log(`  Status: ${initiative.status}`);
      console.log(`  Description: ${initiative.description?.substring(0, 50)}${initiative.description?.length > 50 ? '...' : ''}`);
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching initiatives:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data:`, error.response.data);
      console.error(`  Headers:`, error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('  No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('  Error setting up request:', error.message);
    }
    throw error;
  }
}

// Test function to create an initiative
async function testCreateInitiative() {
  try {
    const initiativeData = {
      name: `Test Initiative ${new Date().toISOString()}`,
      description: 'Created by API test script',
      status: 'planning',
      priority: 'medium',
      tags: ['test', 'api'],
      keyRisks: ['None, this is a test']
    };
    
    console.log(`\nAttempting to create initiative: ${initiativeData.name}`);
    
    const response = await apiClient.post('/api/initiatives', initiativeData);
    
    console.log('Success! Initiative created:');
    console.log(`  ID: ${response.data.id || response.data._id}`);
    console.log(`  Name: ${response.data.name}`);
    console.log(`  Created At: ${response.data.createdAt}`);
    
    return response.data;
  } catch (error) {
    console.error('Error creating initiative:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data:`, error.response.data);
    } else if (error.request) {
      console.error('  No response received');
    } else {
      console.error('  Error:', error.message);
    }
    throw error;
  }
}

// Run the tests
async function runTests() {
  try {
    console.log('=== INITIATIVES API TEST ===\n');
    
    // Test getting initiatives
    const initiatives = await testGetInitiatives();
    
    // Only create a test initiative if we successfully retrieved existing ones
    if (initiatives) {
      await testCreateInitiative();
    }
    
    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('\n=== TEST FAILED ===');
    process.exit(1);
  }
}

// Run the tests
runTests();