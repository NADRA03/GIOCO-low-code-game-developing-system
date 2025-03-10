const API_BASE_URL = 'http://192.168.0.100:3000';                           ////////here////////
// const API_BASE_URL = 'http://172.20.10.5:3000'; 
const API_ENDPOINTS = {
  user_plays: (userId) => `${API_BASE_URL}/user/plays/${userId}`,
  a_profile: (userId) => `${API_BASE_URL}/a_user_data/${userId}`,  
  login: `${API_BASE_URL}/login`,
  signup: `${API_BASE_URL}/signup`,
  edit_user_profile: `${API_BASE_URL}/edit_user_profile`,
  all_profile: `${API_BASE_URL}/all_user_data`,
  edit_email: `${API_BASE_URL}/edit-email`,
  edit_password: `${API_BASE_URL}/edit-password`,
  all_profiles: `${API_BASE_URL}/all_users_data`,
  profile: `${API_BASE_URL}/profile`,
  profile_all: `${API_BASE_URL}/profile_all`,
  game_create: `${API_BASE_URL}/game/new`, 
  png_create: `${API_BASE_URL}/game/convert-svg-to-png`,
  add_asset: `${API_BASE_URL}/user/add_asset`, 
  check_user_collected_asset: `${API_BASE_URL}/user/check_user_collected_asset`,
  send_report: `${API_BASE_URL}/user/send_report`,
  user_games: (userId) => `${API_BASE_URL}/user/games/${userId}`, 
  get_draws: (userId) => `${API_BASE_URL}/user/get_draws/${userId}`,
  get_last_10_assets_for_user: (user_id) => `${API_BASE_URL}/user/get_last_10_assets_for_user/${user_id}`,
  delete_asset: (id) => `${API_BASE_URL}/game/delete_asset/${id}`,
  get_assets_for_game: (game_id) => `${API_BASE_URL}/game/get_assets_for_game/${game_id}`,
  top_10_most_liked_games: `${API_BASE_URL}/game/top_10_most_liked_games`,
};

export default API_ENDPOINTS;