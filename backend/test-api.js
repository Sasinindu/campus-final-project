const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test login
    console.log('\n1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'dr.sunil@hospital.com',
      password: 'password123'
    });
    
    console.log('Login successful:', loginResponse.data);
    const token = loginResponse.data.data.token;
    
    // Test doctor patients endpoint
    console.log('\n2. Testing doctor patients endpoint...');
    const patientsResponse = await axios.get('http://localhost:5000/api/doctor/patients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Patients response:', JSON.stringify(patientsResponse.data, null, 2));
    console.log('Number of patients:', patientsResponse.data.data?.length || 0);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAPI(); 