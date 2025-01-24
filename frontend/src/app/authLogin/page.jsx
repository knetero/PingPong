'use client';

import React, { useState, useEffect } from 'react';
import  handleVerification from './services';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';


import { sendCode, handleVerify } from '../(Home)/Settings/onClickFunc';

function Auth2faPage() {

  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setCode(value);
      // console.log("code : ", code);
    }
  };

  useEffect(() => {

    const codeSentFlag = localStorage.getItem('codeSent');

    if (!codeSentFlag) {
      sendCode();
      localStorage.setItem('codeSent', 'true');
    }
  }, []);



  return (
    
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center animate-fadeIn  absolute top-0 left-0">
    <Toaster /> 
    <div className="bg-[#F4F4FF] flex flex-col items-center shadow-lg rounded-xl w-[95%] h-[80%] sm:h-[90%] border-solid border-[#BCBCC9] border-2 max-w-[900px] max-h-[900px] min-h-[580px] rounded-xl pt-8 animate-scaleIn">
      <div className="relative flex flex-col items-center w-full h-full">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-[#242F5C] pt-4 sm:pt-8 text-center">Two Factor Authenticator</h1>
        <hr className="w-[70%] h-[3px] bg-[#CDCDE5] border-none rounded-full mt-4 sm:mt-8" />
        <h1 className="text-lg sm:text-xl font-bold tracking-wide text-[#242F5C] pt-4 sm:pt-8 text-center pt-20 pb-8">A verification code has been sent to your email.</h1>
        <h1 className="text-lg sm:text-xl font-bold tracking-wide text-[#242F5C] pt-4 sm:pt-8 text-right absolute top-[38%] sm:top-[25%] left-[6%] sm:left-[17%]">2FA Security code :</h1>





        <div className="flex flex-col items-center bg-[#DAE4FF] w-[90%] sm:w-[70%] h-[10%] rounded-xl my-28 sm:my-28 relative shadow ">
                  <input 
                    type="number"  
                    value={code} 
                    max="9999"
                    id="code"
                    onChange={handleChange} 
                    onKeyDown={(e) => {
                      if (e.key === 'e' || e.key === '+' || e.key === '-' || e.key === '.') {
                        e.preventDefault();
                      }
                    }}
                    className="w-[90%] sm:w-[90%] h-[90%] text-[#242F5C] text-lg sm:text-lg font-semibold bg-[#DAE4FF] focus:outline-none dark:bg-[#242F5C] dark:text-white"
                    placeholder="Enter your code."/>
                    {/* send button ---------------------------------*/}
                    {/* <button type="submit" onClick={sendCode} className="shadow shadow-lg text-white bg-[#111B47] focus:ring-4 focus:outline-none absolute top-[23%] left-[80%] font-semibold rounded-full text-sm sm:text-lg w-[18%] h-[50%] text-center dark:bg-blue-600 dark:hover:bg-blue-600 dark:focus:ring-blue-800 transition-transform duration-300 ease-in-out transform hover:scale-105">Send */}
                  {/* </button> */}
          </div>
          {error && <p className="text-red-500 text-lg font-semibold">{error}</p>}
          <button type="submit" onClick={() => handleVerification(code, router, setError)} className="text-white bg-[#111B47] focus:ring-4 focus:outline-none font-semibold rounded-full text-lg w-[60%] sm:w-[20%] py-3 sm:h-[6%] text-center dark:bg-blue-600 dark:hover:bg-blue-600 dark:focus:ring-blue-800 transition-transform duration-300 ease-in-out transform hover:scale-105 mt-4 sm:mt-0">Verify</button>
      
          











        
        
        
        {/* <div className="flex flex-col items-center bg-[#DAE4FF] w-[90%] sm:w-[70%] h-[10%] rounded-xl my-28 sm:my-28 relative">
          <button type="submit" className="text-white bg-[#111B47] focus:ring-4 focus:outline-none absolute top-[23%] left-[80%] font-semibold rounded-full text-sm sm:text-lg w-[18%] h-[50%] text-center dark:bg-blue-600 dark:hover:bg-blue-600 dark:focus:ring-blue-800 transition-transform duration-300 ease-in-out transform hover:scale-105">Send</button>
        </div> */}


      </div>
    </div>
  </div>
  );
}

export default Auth2faPage;