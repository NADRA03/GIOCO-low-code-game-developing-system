const API_BASE_URL = 'http://192.168.0.112:3000';                           ////////here////////
// const API_BASE_URL = 'http://172.20.10.3:3000'; 
const API_ENDPOINTS = {
  user_plays: (userId) => `${API_BASE_URL}/user/plays/${userId}`,
  login: `${API_BASE_URL}/login`,
  profile: `${API_BASE_URL}/profile`,
  profile_all: `${API_BASE_URL}/profile_all`,
  game_create: `${API_BASE_URL}/game/new`, 
  add_asset: `${API_BASE_URL}/user/add_asset`, 
  check_user_collected_asset: `${API_BASE_URL}/user/check_user_collected_asset`,
  user_games: (userId) => `${API_BASE_URL}/user/games/${userId}`, 
  get_last_10_assets_for_user: (user_id) => `${API_BASE_URL}/user/get_last_10_assets_for_user/${user_id}`,
  delete_asset: (id) => `${API_BASE_URL}/game/delete_asset/${id}`,
  get_assets_for_game: (game_id) => `${API_BASE_URL}/game/get_assets_for_game/${game_id}`,
};

export default API_ENDPOINTS;