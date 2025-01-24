'use client';
import axios from 'axios';
// import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';




export default async function handleVerification(code, router, setError)  {
    

    // console.log("code : ", code);

    if (!code.trim()) {
        setError('Please enter the security code.');
        return;
    }
    if (code.length < 6) {
        setError('Please enter a valid security code.');
        return;
      } 


    try {

        const result = await axios.post('https://10.13.7.8/api/api/user_2fa/',
        {code : code},
        { withCredentials: true, headers: {} }
    );




        if(result.data.message === '2fa is done') // check what the back end send later ...
        {
            toast.success('Verification done successfully!');
            router.push('/Dashboard');
        } else {
            toast.error(result.data.message);
        }

    } catch (error) {
        console.log(result);
    }

    setError('');
  }
