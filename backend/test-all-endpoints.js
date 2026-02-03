const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

const endpoints = [
  { method: 'GET', path: '/health', name: 'Health Check' },
  { method: 'GET', path: '/api/status', name: 'API Status' },
  { method: 'GET', path: '/Users', name: 'Get All Users' },
  { method: 'GET', path: '/incidents', name: 'Get All Incidents' },
  { method: 'GET', path: '/schedules', name: 'Get All Schedules' },
  { method: 'GET', path: '/availability', name: 'Get All Availability' },
  { method: 'GET', path: '/trainings', name: 'Get All Trainings' },
  { method: 'GET', path: '/api/categories', name: 'Get All Categories' },
  { method: 'GET', path: '/api/items', name: 'Get All Items' },
  { method: 'GET', path: '/api/inspections', name: 'Get All Inspections' }
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🔍 Testing ${endpoint.name}...`);
    const response = await axios({
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.path}`,
      timeout: 5000
    });
    
    console.log(`✅ ${endpoint.name}: ${response.status} - ${response.data.message || 'Success'}`);
    
    if (response.data.data) {
      console.log(`   📊 Data count: ${Array.isArray(response.data.data) ? response.data.data.length : 'N/A'}`);
    }
    
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    console.log(`❌ ${endpoint.name}: ${error.response?.status || 'Connection Failed'} - ${error.message}`);
    return { success: false, error: error.message, status: error.response?.status };
  }
}

async function testAllEndpoints() {
  console.log('🚀 Starting Fire Brigade API Test Suite...\n');
  console.log('=' * 50);
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push({ ...endpoint, ...result });
  }
  
  console.log('\n' + '=' * 50);
  console.log('📋 Test Summary:');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n🏁 Test completed!');
}

// Run the tests
testAllEndpoints().catch(console.error);
