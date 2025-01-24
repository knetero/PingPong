

    // # endpoints:
    // # update profile : localhost:8000/api/update_user/{ username , current_password, new_password } post 

    // # if he he clickes on send - back end send a code to his emal , 
    // # enable 2fa : localhost:8000/api/sendcode/ 

    // # the suer should enter the code to verify his email and he shoul  click on virify
    // # 2fa code vefirication : localhost:8000/api/CodeVerification/ {code } post 

    // # logout : localhost:8000/api/logout post 
//-------------------------------------------
'use client'; 
import axios from 'axios';



// const axiosInstance = axios.create({
//   baseURL: 'https://10.13.7.8/api',
//   withCredentials: true,
//   headers: {}
// });

  
//----------------------------

// axios.get('https://10.13.7.8/api/api/getuserinfo/', {
//     headers: {
//         Authorization: `Bearer ${token}` // Authentication token (if needed)
//     },
//     withCredentials: true // Send cookies if necessary
// })
// .then(response => {
//     console.log(response.data);
// })
// .catch(error => {
//     console.error(error);
// });






const Services = {
    






    updateProfileService: async (data) => {
        const formData = new FormData();

        // Append the other data fields
        // console.log(data)
        formData.append('username', data.username ?data.username: '');
        formData.append('current_password', data.current_password ?data.current_password:'');
        formData.append('new_password', data.new_password ?data.new_password:'');
        formData.append('profile_photo', data.profile_image ?data.profile_image:{}); 



        // Log the form data for debugging
        // for (let [key, value] of formData.entries()) {
        //     console.log(key, value);
        // }

        // Send the FormData object directly in the request body
        return axios.post('https://10.13.7.8/api/api/update_user/', 
            formData,   
            {   withCredentials: true, headers: {} });
    },

    sendCodeService: async () => {
        
      return axios.get('https://10.13.7.8/api/api/sendcode/', 

      { withCredentials: true, headers: {} }
    );
    
        // return axiosInstance.post('/api/sendcode/');


    },


    handleVerifyService: async (code) => {
        // console.log('=== Verifying code :', code);

        return axios.post('https://10.13.7.8/api/api/CodeVerification/', 
            {code : code},
            { withCredentials: true, headers: {} });
        
        
    }
};

export default Services;
