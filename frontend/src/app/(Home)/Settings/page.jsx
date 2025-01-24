"use client";
import { Inter, Montserrat } from "next/font/google";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion"
import TwoFA from "./2fa";
import UpdateProfile from "./UpdateProfile"
import toast, { Toaster } from 'react-hot-toast';

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});





function Settings() {

  const [isMobile, setIsMobile] = useState(false);
  const [isIcon, setIsIcon] = useState(false);
  const [isProfile, setIsProfile] = useState(false);
  const [is2FA, setIs2FA] = useState(false);








  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsIcon(window.innerWidth <= 1317);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  return (

    <div className={`flex-1 overflow-y-auto flex flex-wrap items-center justify-center relative h-full ${isMobile ? '' : 'p-4'}`}>
      <Toaster /> 
      <motion.div
        className={` ${isMobile ? 'w-full mt-4' : 'motion-preset-expand rounded-3xl border-solid border-[#BCBCC9] bg-[#F4F4FF] rounded-3xl border-[#BCBCC9] bg-[#F4F4FF]'} flex flex-col min-w-[500px] min-h-[600px] relative shadow-lg shadow-[#BCBCC9] items-center 
            md:w-[45%] h-full sm:h-[80%] md:h-[72%] bg-[#F4F4FF] justify-center p-4`}

      >
        <div className="w-[70%] xl:w-[70%] lg:w-[70%]  md:w-[70%] h-full mt-2 md:mt-2 lg:mt-5 flex flex-col items-center space-y-16 relative">
          <div className="flex flex-row items-center justify-arround space-x-4">
            <Image src="/images/settings.svg" alt="Settings" width={80} height={80} priority className="w-20 h-20 " />
            {isIcon ? ''
              :
              <h1 className="text-3xl lg:text-3xl xl:text-5xl md:text-3xl  font-extrabold content-center tracking-wide text-[#242F5C]">
                SETTINGS
              </h1>}
          </div>
          <div className="w-full flex justify-center">
            <hr className="w-full h-[3px] bg-[#CDCDE5] border-none rounded-full my-2" />
          </div>




          
          <div onClick={() => { setIsProfile(!isProfile) }} className="w-full max-w-md rounded-xl flex items-center justify-center bg-[#D7D7EA] shadow-md shadow-[#BCBCC9] p-4 cursor-pointer hover:bg-[#E1E1EF] transition-colors duration-300 transition-transform duration-300 transform hover:scale-105 ease-in-out">
            <Image src="/images/profile.svg" alt="Profile" width={64} height={64} className="w-12 h-12 sm:w-16 sm:h-16" />
            {!isIcon && (
              <h1 className="ml-4 text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-[#242F5C]">Profile</h1>
            )}
          </div>
          <div onClick={() => { setIs2FA(!is2FA) }} className="w-full max-w-md rounded-xl flex items-center justify-center bg-[#D7D7EA] shadow-md shadow-[#BCBCC9] p-4 cursor-pointer hover:bg-[#E1E1EF] transition-colors duration-300 transition-transform duration-300transform hover:scale-105 ease-in-out">
            <Image src="/images/auth.svg" alt="Profile" width={64} height={64} className="w-12 h-12 sm:w-16 sm:h-16" />
            {!isIcon && (
              <h1 className="ml-4 text-xl sm:text-xl md:text-2xl font-bold tracking-wide text-[#242F5C]">2FA Authentication</h1>
            )}
          </div>






        </div>
      </motion.div>
      {/* My chnages --------------------------------------------------------------------------- */}
      {isProfile && (<UpdateProfile setIsProfile={setIsProfile} />)} 
      {is2FA && (    <TwoFA         setIs2FA={setIs2FA}       /> )}
    </div>
  );
}

export default Settings;