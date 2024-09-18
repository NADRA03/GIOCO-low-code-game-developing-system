const API_BASE_URL = 'http://192.168.100.31:3000';                           ////////here////////
// const API_BASE_URL = 'http://172.20.10.3:3000'; 
const API_ENDPOINTS = {
  login: `${API_BASE_URL}/login`,
  profile: `${API_BASE_URL}/profile`,
  profile_all: `${API_BASE_URL}/profile_all`,
};

export default API_ENDPOINTS;