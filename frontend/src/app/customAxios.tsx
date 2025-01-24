import axios, { AxiosResponse, AxiosError } from 'axios';
// import Cookies from 'js-cookie';




const customAxios = axios.create({
    baseURL: 'https://10.13.7.8/api',
    // Optional: Set default headers
    withCredentials: true, 
    headers: {
    //   'Content-Type': 'application/json',
    //     'Accept': 'application/json',
        // 'Authorization': `Bearer ${getCookie('accessToken')}`
    }
    
  });



customAxios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          if (window.location.pathname != '/login' && window && window.location && window.location.pathname != '/signup') {
                window.location.href = '/login';
          }
          break;
        case 400:
          console.log('Bad request:', error.response.data);
          break;
        default:
          console.log('An error occurred:', error.response.data);
          break;
      }
    } else {
      console.log('Error connecting to the server:', error.message);
    }


    return Promise.reject(error);
  }
);

export default customAxios;