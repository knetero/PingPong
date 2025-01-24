
import customAxios from './customAxios';

const API_URL = process.env.SIGNUP_API;

const authService = {
  login: (email, password) => {
    return customAxios.post('https://10.13.7.8/api/api/login/', { email, password });
  },
  signup: (username, email, password) => {
    return customAxios.post('https://10.13.7.8/api/api/register/', { username, email, password });
  },
  logout: () => {
    localStorage.removeItem('codeSent');
    return customAxios.post('https://10.13.7.8/api/api/logout/');
  },
  _42API: () => {
    return customAxios.get('https://10.13.7.8/api/oauth/login/');
  },
  _42CALLBACK: () => {
    return customAxios.get('https://10.13.7.8/api/oauth/user_data/');
  },
  user_data: () => {
    return customAxios.get(`https://10.13.7.8/api/oauth/user_data/`);
  }
};

export default authService;
