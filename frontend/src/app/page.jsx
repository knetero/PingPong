"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Montserrat } from 'next/font/google'
import { useRouter } from "next/navigation";
import TextGenerateEffect from '/src/compo/ui/text-generate-effect'
import { motion } from 'framer-motion'
import customAxios from "./customAxios";
import Spinner from './components/Loading';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    router.push('/login');
  }

  const handleSignUp = () => {
    router.push('/signup');
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    }
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true);
        const response = await customAxios.get(
          "https://10.13.7.8/api/api/user_logged_in/",
          {
            withCredentials: true,
          }
        );
        if (response.data.message === "done") {
          if(response.data.data.is_2fa){ 
            router.replace("/authLogin");
          }
          else
            
            router.replace("/Dashboard");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error.message);
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router])

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }
  
  return (
    <div className={`relative z-10 min-h-screen ${montserrat.className}`}>
      <nav className={`flex justify-between sm:px-20 sm:pt-18 w-full sm:items-center sm:h-[200px] fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white bg-opacity-15 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
        <motion.div>
          <Image 
            priority 
            src="/images/logo.webp" 
            alt="Logo" 
            width={150} 
            height={150} 
            className="sm:h-[170px] sm:w-[160px] w-[80px] h-[80px] motion-scale-in-[0.5] motion-translate-x-in-[-120%] motion-translate-y-in-[-60%] motion-opacity-in-[33%] motion-rotate-in-[-380deg] motion-blur-in-[10px] motion-delay-[0.38s]/scale motion-duration-[0.38s]/opacity motion-duration-[1.20s]/rotate motion-duration-[0.15s]/blur motion-delay-[0.60s]/blur motion-ease-spring-bouncier" 
          />
        </motion.div>
        <div className="flex gap-2 pt-5">
          <button onClick={handleSignUp} type="button" className="motion-preset-expand text-white bg-[#111B47] hover:bg-[#0e1739] hover:ring-4 focus:ring-[#1d2f7a] font-bold rounded-full text-xs h-[45px] w-[80px] sm:text-lg sm:h-[70px] sm:w-[180px] text-center me-2 mb-2 transition duration-300 ease-in-out shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px] border-solid border-b-4 border-gray-600">Sign up</button>
          <button onClick={handleLogin} type="button" className="motion-preset-expand text-white bg-[#111B47] hover:bg-[#0e1739] hover:ring-4 focus:ring-[#1d2f7a] font-bold rounded-full text-xs h-[45px] w-[80px] sm:text-lg sm:h-[70px] sm:w-[180px] text-center me-2 mb-2 transition duration-300 ease-in-out shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px] border-solid border-b-4 border-gray-600">Login</button>
        </div>
      </nav>
      <div className="w-full flex justify-center items-center">
        <div className="sm:flex sm:justify-around sm:w-full items-center max-w-[2000px] min-h-screen pt-[140px]">
          <div className="w-[100%] sm:max-w-[800px] w-5/6 pl-8">
            <h1 className={`font-bold xxl:text-[100px] sm:text-[60px] text-[30px] flex flex-col pb-5 ${montserrat.className}`}>
              <span className="block -mb-[0.4em] font-extrabold text-[#111B47]">ONLINE</span>
              <span className="block -mb-[0.4em] font-extrabold text-[#111B47]">PING PONG</span>
              <span className="block font-extrabold text-[#111B47]">GAME</span>
            </h1>
            <TextGenerateEffect words="Welcome to Ultimate Pong Arena, where the classic game meets modern competition." />
            <TextGenerateEffect words="Dive into fast-paced matches, climb the leaderboards, and join a community of enthusiasts." />
            <TextGenerateEffect words="Ready for action?  Let the games begin!" />
          </div>
          <motion.div className="sm:w-[50%] sm:max-w-[600px] motion-preset-oscillate motion-duration-[8000ms]">
            <Image
              src="/images/pong.svg"
              alt="Pong"
              width={600}
              height={400}
              className="pongImg xl:w-[95%] lg:w-[90%] md:w-[90%] w-[85%] ml-5"
              priority
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}