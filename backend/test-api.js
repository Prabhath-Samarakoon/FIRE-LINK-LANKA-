const http = require('http');

const API_BASE_URL = 'http://localhost:5000';

// Test data for incidents
const testIncident = {
  callerName: "John Doe",
  callerPhone: "0712345678",
  address: "123 Test Street, Colombo",
  coordinates: "6.9271, 79.8612",
  incidentType: "Building",
  hazards: ["Gas Cylinders"],
  peopleTrapped: 2,
  injured: 1,
  crowdSize: "Medium",
  emergencyScale: "High",
  liveNotes: "Test incident for API verification",
  priority: "High",
  safetyAdvice: ["Evacuate immediately"]
};

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsedBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🚒 Testing Fire Brigade Console API...\n');

  try {
    // Test 1: Create Incident
    console.log('1. Testing CREATE incident...');
    const createResponse = await makeRequest(`${API_BASE_URL}/incidents`, 'POST', testIncident);
    
    if (createResponse.status === 201) {
      console.log('✅ Incident created successfully:', createResponse.data.incident.callId);
      
      const incidentId = createResponse.data.incident._id;
      
      // Test 2: Get Incident by ID
      console.log('\n2. Testing READ incident...');
      const getResponse = await makeRequest(`${API_BASE_URL}/incidents/${incidentId}`);
      
      if (getResponse.status === 200) {
        console.log('✅ Incident retrieved successfully:', getResponse.data.incident.callId);
      } else {
        console.log('❌ Failed to retrieve incident');
      }
      
      // Test 3: Update Incident
      console.log('\n3. Testing UPDATE incident...');
      const updateData = { ...testIncident, liveNotes: "Updated test notes" };
      const updateResponse = await makeRequest(`${API_BASE_URL}/incidents/${incidentId}`, 'PUT', updateData);
      
      if (updateResponse.status === 200) {
        console.log('✅ Incident updated successfully');
      } else {
        console.log('❌ Failed to update incident');
      }
      
      // Test 4: Update Status
      console.log('\n4. Testing UPDATE status...');
      const statusResponse = await makeRequest(`${API_BASE_URL}/incidents/${incidentId}/status`, 'PATCH', { status: 'Dispatched' });
      
      if (statusResponse.status === 200) {
        console.log('✅ Status updated successfully');
      } else {
        console.log('❌ Failed to update status');
      }
      
      // Test 5: Get All Incidents
      console.log('\n5. Testing READ all incidents...');
      const getAllResponse = await makeRequest(`${API_BASE_URL}/incidents`);
      
      if (getAllResponse.status === 200) {
        console.log('✅ Retrieved all incidents. Count:', getAllResponse.data.incidents.length);
      } else {
        console.log('❌ Failed to retrieve all incidents');
      }
      
      // Test 6: Get Statistics
      console.log('\n6. Testing GET statistics...');
      const statsResponse = await makeRequest(`${API_BASE_URL}/incidents/stats`);
      
      if (statsResponse.status === 200) {
        console.log('✅ Statistics retrieved successfully. Total incidents:', statsResponse.data.overall.total);
      } else {
        console.log('❌ Failed to retrieve statistics');
      }
      
      // Test 7: Search Incidents
      console.log('\n7. Testing SEARCH incidents...');
      const searchResponse = await makeRequest(`${API_BASE_URL}/incidents/search?q=John`);
      
      if (searchResponse.status === 200) {
        console.log('✅ Search completed. Results found:', searchResponse.data.total);
      } else {
        console.log('❌ Failed to search incidents');
      }
      
      // Test 8: Delete Incident
      console.log('\n8. Testing DELETE incident...');
      const deleteResponse = await makeRequest(`${API_BASE_URL}/incidents/${incidentId}`, 'DELETE');
      
      if (deleteResponse.status === 200) {
        console.log('✅ Incident deleted successfully');
      } else {
        console.log('❌ Failed to delete incident');
      }
      
    } else {
      console.log('❌ Failed to create incident:', createResponse.data);
    }
    
    // Test 9: Test User API
    console.log('\n9. Testing User API...');
    const userResponse = await makeRequest(`${API_BASE_URL}/users`);
    
    if (userResponse.status === 200) {
      console.log('✅ User API working. Users found:', userResponse.data.users ? userResponse.data.users.length : 0);
    } else {
      console.log('❌ User API not working');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
  
  console.log('\n🎯 API testing completed!');
}

// Run the test
testAPI();
