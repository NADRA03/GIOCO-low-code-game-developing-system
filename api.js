const API_BASE_URL = 'http://192.168.0.101:3000';                           ////////here////////
// const API_BASE_URL = 'http://172.20.10.3:3000'; 
const API_ENDPOINTS = {
  user_plays: (userId) => `${API_BASE_URL}/user/plays/${userId}`,
  login: `${API_BASE_URL}/login`,
  profile: `${API_BASE_URL}/profile`,
  profile_all: `${API_BASE_URL}/profile_all`,
  game_create: `${API_BASE_URL}/game/new`, 
};

export default API_ENDPOINTS;