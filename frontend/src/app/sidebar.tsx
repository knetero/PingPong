'use client'

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import { useClickAway } from "@uidotdev/usehooks";
import { motion } from "framer-motion";
import Image from "next/image";
import { useUser } from './contexts/UserContext';
import { Skeleton}  from "../compo/ui/Skeleton";
import authService from "./authService";
import { FaBarsStaggered } from "react-icons/fa6";

const variants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: "-100%" },
};

export default function Sidebar() {
  const router = useRouter();
  const { setUserData } = useUser(); 
  const { userData, isLoading } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);



  const sideRef = useClickAway<HTMLDivElement>(() => {
    setIsMobileMenuOpen(false);
  });

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await authService.logout();
      if (response.status !== 200) {
        throw new Error('Logout failed');
      }
      
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      setUserData(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
    
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  

  return (
    <div ref={sideRef}>
      {isMobile && (
        <button
          className="fixed top-8 left-3 z-50 text-2xl text-[#242F5C]"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <FaBarsStaggered />
        </button>
      )}
      <motion.div
        className={`${isMobile
          ? `fixed top-0 left-0 h-full w-64 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out z-40`
          : "w-64 h-full"
        } bg-[#F4F4FF] items-center flex justify-center shadow-md shadow-[#BCBCC9] flex-col fixed top-0 z-[10] 
        `}
        animate={isMobile ? (isMobileMenuOpen ? "open" : "closed") : "open"}
        variants={variants}
        initial={isMobile ? "closed" : "open"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {!isMobile && (
          <div className="flex items-center justify-center motion-scale-in-[0.5] motion-translate-x-in-[-120%] motion-translate-y-in-[-60%] motion-opacity-in-[33%] motion-rotate-in-[-380deg] motion-blur-in-[10px] motion-delay-[0.38s]/scale 
          motion-duration-[0.38s]/opacity motion-duration-[1.20s]/rotate motion-duration-[0.15s]/blur motion-delay-[0.60s]/blur motion-ease-spring-bouncier">
            <Image src="/images/logo.png" alt="Logo" width={120} height={100} className="w-[120px] h-[100px]" priority/>
          </div>
        )}
        <ul className="flex flex-col gap-8 pt-20 h-[80%]">
          <li>
            <Link
              href="/Dashboard"
              className="flex items-center py-2 px-4 font-semibold rounded transition-transform duration-200 ease-in-out transform hover:scale-110 text-xl text-[#242F5C] cursor-pointer transition-colors"
            >
              <Image
                src="/images/dashboard.svg"
                alt="Dashboard"
                width={30}
                height={30}
                className="mr-3 w-[30px] h-[30px]"
              />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/Friends"
              className="flex items-center py-2 px-4 rounded font-semibold transition-transform duration-200 ease-in-out transform hover:scale-110 text-xl text-[#242F5C] cursor-pointer transition-colors"
            >
              <Image
                src="/images/friends.svg"
                alt="Friends"
                width={30}
                height={30}
                className="mr-3 w-[30px] h-[30px]"
              />
              Friends
            </Link>
          </li>
          <li>
            <Link
              href="/Chatt"
              className="flex items-center py-2 px-4 rounded font-semibold transition-transform duration-200 ease-in-out transform hover:scale-110 text-xl text-[#242F5C] cursor-pointer transition-colors"
            >
              <Image
                src="/images/chat.svg"
                alt="Chatt"
                width={30}
                height={30}
                className="mr-3 w-[30px] h-[30px]"
              />
              Chat
            </Link>
          </li>
          <li>
            <Link
              href="/Game"
              className="flex items-center py-2 px-4 rounded font-semibold transition-transform duration-200 ease-in-out transform hover:scale-110 text-xl text-[#242F5C] cursor-pointer transition-colors"
            >
              <Image
                src="/images/game.svg"
                alt="Game"
                width={30}
                height={30}
                className="mr-3 w-[30px] h-[30px]"
              />
              Game
            </Link>
          </li>
          <li>
            <Link
              href="/Settings"
              className="flex items-center py-2 px-4 rounded font-semibold transition-transform duration-200 ease-in-out transform hover:scale-110 text-xl text-[#242F5C] cursor-pointer transition-colors"
            >
              <Image
                src="/images/settings.svg"
                alt="Settings"
                width={30}
                height={30}
                className="mr-3 w-[30px] h-[30px]"
              />
              Settings
            </Link>
          </li>
        </ul>
        <div className="w-full max-w-[100%] sm:mb-10">
          <hr className="border-[#242F5C] border-t-1 m-auto w-[80%]" />
          <div className="flex items-center justify-center mt-8 gap-4">
            {isLoading || isLoggingOut ?  (
              <>
                <Skeleton className="w-14 h-14 rounded-full bg-[#d1daff]" />
                <div className="flex flex-col gap-2 ">
                  <Skeleton className="h-4 w-20 bg-[#d1daff]" />
                  <Skeleton className="h-3 w-16 bg-[#d1daff]" />
                </div>
              </>
            ) : (
              <>
                <div className="relative w-14 h-14">
                  {avatarLoading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full border-[#242F5C]">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#242F5C]"></div>
                    </div>
                  )}
                  <img
                    src={userData?.image_field ? `https://10.13.7.8/api/api${userData.image_field}` : "/images/DefaultAvatar.svg"}
                    alt="User avatar"
                    width={50}
                    height={50}
                    className={`rounded-full object-cover w-14 h-14 border-[1px] border-transparent 
                      outline outline-2 outline-offset-2 outline-[#242F5C] transition-opacity duration-300 ${avatarLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setAvatarLoading(false)}
                  />
                </div>
                <div className="">
                  <p className="text-center text-lg font-normal text-[#242F5C]">
                    
                    {userData?.username}
                  </p>
                  <p className="text-center text-[12px] mt-[-5px] font-light text-[#8988DE]">
                    My Account
                  </p>
                </div>
              </>
            )}
            <button
              onClick={logout}
              aria-label="Logout"
              className="cursor-pointer"
            >
              <Image
                src="/images/logout.svg"
                alt="Logout"
                width={20}
                height={20}
                className="w-[20px] h-[20px]"
              />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}