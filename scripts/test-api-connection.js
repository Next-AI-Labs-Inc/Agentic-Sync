#!/usr/bin/env node

const axios = require('axios');

// Define API endpoints to test
const localApiUrl = 'http://localhost:3002/api/developer/tasks?limit=1';
const productionApiUrl = 'https://api.ixcoach.com/api/developer/tasks?limit=1';

// Log headers
console.log('\n===== API CONNECTION TEST =====');
console.log('This test will try to connect to both local and production API endpoints');
console.log('to verify connectivity. Use this after building the Tauri app.');

// Test local API
console.log('\n🔍 Testing LOCAL API connection...');
axios.get(localApiUrl)
  .then(response => {
    console.log('✅ Local API connection successful!');
    console.log(`- Status: ${response.status}`);
    console.log(`- Tasks found: ${response.data?.data?.length || 0}`);
  })
  .catch(error => {
    console.log('❌ Local API connection failed:');
    console.log(`- Error: ${error.message}`);
    if (error.response) {
      console.log(`- Status: ${error.response.status}`);
      console.log(`- Data: ${JSON.stringify(error.response.data)}`);
    }
  })
  .finally(() => {
    // Test production API
    console.log('\n🔍 Testing PRODUCTION API connection...');
    axios.get(productionApiUrl)
      .then(response => {
        console.log('✅ Production API connection successful!');
        console.log(`- Status: ${response.status}`);
        console.log(`- Tasks found: ${response.data?.data?.length || 0}`);
      })
      .catch(error => {
        console.log('❌ Production API connection failed:');
        console.log(`- Error: ${error.message}`);
        if (error.response) {
          console.log(`- Status: ${error.response.status}`);
          console.log(`- Data: ${JSON.stringify(error.response.data)}`);
        }
      })
      .finally(() => {
        console.log('\n===== TEST COMPLETE =====');
        console.log('Remember: The Tauri app should use the production API when built.');
        console.log('To verify this is working, check the logs when starting the app.\n');
      });
  });