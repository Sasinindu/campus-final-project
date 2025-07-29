const axios = require('axios');

async function testEndpoint() {
  try {
    // First, login as a doctor to get JWT token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'dr.sunil@hospital.com',
      password: 'password123'
    });

    const token = loginResponse.data.data.token;
    console.log('JWT Token obtained successfully');

    // Now test the doctor patients endpoint
    const patientsResponse = await axios.get('http://localhost:5000/api/doctor/patients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Patients endpoint response:');
    console.log(JSON.stringify(patientsResponse.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testEndpoint(); 