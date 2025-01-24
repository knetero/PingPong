"use client";
import Image from "next/image";
import { useClickAway } from "@uidotdev/usehooks";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { IoIosSearch } from "react-icons/io";
import authService from "./authService";
import { useWebSocket } from './contexts/WebSocketProvider';
import axios from "axios";
import { showAlert } from "./components/utils";
import { useRouter } from 'next/navigation';


import { useUser } from './contexts/UserContext';
import  useSearch from './contexts/SearchContext';


import { Skeleton}  from "../compo/ui/Skeleton";
import NotificationDropdown from './components/NotificationDropdown';

const logout = async ({ setUserData }) => {

  try {
    const response = await authService.logout();
    if (response.status !== 200) {
      throw new Error('Logout failed');
    }
    
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUserData(null);
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const LogoutProfile = ({ setUserData }) => {
  return (
    <div
      className="flex flex-row items-center m-3 justify-content relative gap-2 cursor-pointer"
      onClick={() => logout({ setUserData })}
    >
      <Image
        src="/images/logout.svg"
        alt="profile"
        width={50}
        height={50}
        className="w-[18px] h-[18px]"
      />
      <h1 className="text-base font-medium text-[#242F5C]">Log Out</h1>
    </div>
  );
};

const ProfileSetting = () => {
  return (
    <Link href="/Settings">
      <div className="flex flex-row items-center m-3 justify-content relative gap-2 cursor-pointer">
        <Image
          src="/images/settings.svg"
          alt="profile"
          width={50}
          height={50}
          className="w-[18px] h-[18px]"
        />
        <h1 className="text-base font-medium text-[#242F5C]">
          Account Settings
        </h1>
      </div>
    </Link>
  );
};

const ProfileInfo = ({onClick}) => {
  return (
    <div className="flex flex-row items-center m-3 justify-content relative gap-2 cursor-pointer" onClick={onClick}>
      <Image
        src="/images/avatarAcc.svg"
        alt="profile"
        width={50}
        height={50}
        className="w-[18px] h-[18px]"
      />
      <h1 className="text-base font-medium text-[#242F5C]">View Profile</h1>
    </div>
  );
};






function Navbar() {
  



  //--------------------------------------------------------------------------------
  const { inputRef, handleSearch, filteredUsers } = useSearch();
  const [isTyping, setIsTyping] = useState(false);
  const [clickWhere, setClickWhere] = useState(true);


  const handleChange = () => {
    setIsTyping(true);  // Set typing state to true when user starts typing
    handleSearch();  // Call the handleSearch function to filter users
  };

  const handleBlur = () => {

    setTimeout(() => { setIsTyping(false); }, 1000);

  };



  const divRef = useRef(null);


  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setTimeout(() => { setClickWhere(false); }, 1000);
    }
  };
  

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside); 
    return () => {
      document.removeEventListener('mousedown', handleClickOutside); 
    };
  }, []);










  const { userData, isLoading, setUserData } = useUser();

  const router = useRouter();
  const [userDropdown, setUserDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationDropdown, setNotificationDropdown] = useState(false);
  const { addHandler, removeHandler } = useWebSocket();

  const userDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationDropdownRef.current && 
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setNotificationDropdown(false);
      }

      if (
        userDropdownRef.current && 
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleNewNotificationEvent = (event) => {
      const notification = event.detail;
      handleNewNotification(notification);
    };

    window.addEventListener('newNotification', handleNewNotificationEvent);

    return () => {
      window.removeEventListener('newNotification', handleNewNotificationEvent);
    };
  }, []);

  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    setUserDropdown((prev) => !prev);
    setNotificationDropdown(false);
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

  useEffect(() => {
    const handleWebSocketMessage = (data) => {
      if (!data) return;

      try {
        switch (data.type) {
          case 'friends-add':
            // Handle receiving a friend request
            handleNewNotification({
              id: data.freindship_id,
              type: 'friend_request',
              avatar: data.user.image_field ? `https://10.13.7.8/api/api${data.user.image_field}` : '/images/Default_profile.png',
              message: `${data.user.username} sent you a friend request`,
              timestamp: new Date().toISOString(),
              isNew: true,
              senderUsername: data.user.username
            });
            break;

          case 'friend_request_sent':
            // Handle sending a friend request
            handleNewNotification({
              id: data.freindship_id,
              type: 'friend_request_sent',
              avatar: data.user.image_field ? `https://10.13.7.8/api/api${data.user.image_field}` : '/images/Default_profile.png',
              message: `You sent a friend request to ${data.user.username}`,
              timestamp: new Date().toISOString(),
              isNew: true,
              senderUsername: data.user.username
            });
            break;

          case 'friends_accept':
            handleNewNotification({
              id: data.freindship_id,
              type: 'friend_accept',
              avatar: data.user.image_field ? `https://10.13.7.8/api/api${data.user.image_field}` : '/images/Default_profile.png',
              message: `${data.user.username} accepted your friend request`,
              timestamp: new Date().toISOString(),
              isNew: true,
              senderUsername: data.user.username
            });
            break;

          case 'friends_list_update':
            // Update friends list silently
            if (typeof window !== 'undefined') {
              const event = new CustomEvent('friendsListUpdate', { detail: data });
              window.dispatchEvent(event);
            }
            break;

          case 'friends_accept_error':
          case 'friends_block_success':
          case 'friends_block_error':
            // These are status messages, we can ignore them
            break;
        }
      } catch (error) {
        console.error('Error handling notification:', error);
      }
    };

    addHandler(handleWebSocketMessage);

    return () => {
      removeHandler(handleWebSocketMessage);
    };
  }, [addHandler, removeHandler]);

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setNotificationCount(prev => prev + 1);
    
    // Show toast notification
    const message = notification.type === 'friend_request' 
      ? `New friend request from ${notification.senderUsername}`
      : notification.type === 'friend_request_sent'
        ? `You sent a friend request to ${notification.senderUsername}`
        : `${notification.senderUsername} accepted your friend request`;
      
    showAlert(message, 'info');
  };

  const handleNotificationClick = (notification) => {
    // Just mark as not new and update the count
    setNotifications(prev => prev.map(n => 
      n.id === notification.id 
        ? { ...n, isNew: false }
        : n
    ));
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  const toggleNotificationDropdown = (e) => {
    e.stopPropagation();
    setNotificationDropdown(!notificationDropdown);
    if (userDropdown) {
      setUserDropdown(false);
    }
  };

  const toggleUserProfileDropdown = (e) => {
    e.stopPropagation();
    setUserDropdown(!userDropdown);
    if (notificationDropdown) {
      setNotificationDropdown(false);
    }
  };


  return (
    <nav
      className={`bg-[#F4F4FF] py-4 h-[90px] flex items-center shadow-md shadow-[#BCBCC9] z-[9]`}
    >
      <div className="flex justify-end flex-auto sm:gap-5 gap-3 sm:mr-10">
        {/* -------------------------------------------------------------------- */}
        <div className="relative">
          <input
            type="text"
            id="search"
            name="search"
            autoComplete="off"
            placeholder="Search..."
            className="sm:py-3 shadow-sm shadow-[#BCBCC9] sm:w-[280px] py-[8px] w-[200px]  pl-[2.5rem] rounded-full bg-[#D7D7EA] text-[#242F5C] focus:outline-none focus:ring-2 focus:ring-[#3CDCDE5]"
            onChange={handleChange}
            onBlur={handleBlur}
            ref={inputRef}
          />
          <IoIosSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 "
            // onClick={handleSearch}
          />




          {/* Render the filtered users list only when user starts typing -----------------------*/}
          {(isTyping || clickWhere) && filteredUsers.length > 0 && (
            <div ref={divRef}  className="absolute mt-2 w-full bg-[#F4F4FF] shadow-lg rounded-xl max-h-60 overflow-y-auto">
              {filteredUsers.map((user, index) => (
                <div 
                  key={index} 
                  className="px-4 py-2 hover:bg-gray-100 text-[#242F5C] cursor-pointer"
                  onClick={() => {
                    
                    setClickWhere(false);
                    setIsTyping(false);

                    inputRef.current.value = "";
                    router.push(`/Profile/${user.username}`);


                  }}
                >
                  {user.username}
                </div>
              ))}
            </div>
          )}

          {/* Show message when no users match -------------------------------- */}
          {isTyping && filteredUsers.length === 0 && (
            <div className="absolute mt-2 w-full bg-[#F4F4FF] shadow-lg rounded-xl max-h-60 overflow-y-auto">
              <div className="px-4 py-2 text-[#242F5C]">No user found</div>
            </div>
          )}




        </div>

        















        <div ref={notificationDropdownRef}>
          <div 
            className="cursor-pointer relative flex items-center justify-center sm:w-12 sm:h-12 w-10 h-10" 
            onClick={toggleNotificationDropdown}
          >
            <Image
              src="/images/notification.svg"
              alt="notification"
              width={24}
              height={24}
              className="sm:w-8 sm:h-8 w-6 h-6"
            />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full sm:w-6 sm:h-6 w-5 h-5 flex items-center justify-center sm:text-xs text-[10px]">
                {notificationCount}
              </span>
            )}
          </div>
          {notificationDropdown && (
            <NotificationDropdown 
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
            />
          )}
        </div>
        <div ref={userDropdownRef}>
          <div
            className="flex items-center justify-center sm:w-12 sm:h-12 w-10 h-10 rounded-full bg-white text-white relative mr-2"
            onClick={toggleUserProfileDropdown}
          >
            {isLoading ? (
              <>
              <Skeleton className="sm:w-10 sm:h-10 w-8 h-8 rounded-full bg-[#d1daff]" />
            </>
            ) : (
              // <Skeleton className="sm:w-10 sm:h-10 w-8 h-8 rounded-full bg-[#d1daff]" />
            <img
              id="avatarButton"
              className="sm:w-10 sm:h-10 w-8 h-8 rounded-full bg-[#D7D7EA] cursor-pointer rounded-full"
              src={userData?.image_field ? `https://10.13.7.8/api/api${userData.image_field}` : "/images/DefaultAvatar.svg"}
              alt="User dropdown"
              width={100}
              height={100}
              /> 
            )
              }
            <Image
              className="w-4 h-8 cursor-pointer absolute bottom-[-10px] right-0"
              src="/images/Frame21.svg"
              alt="User dropdown"
              width="50"
              height="50"
              />
         
            {userDropdown && (
              <motion.div
              className="w-[220px] h-[210px] bg-[#EAEAFF] border-2 border-solid border-[#C0C7E0] absolute bottom-[-215px] right-[3px] z-[10] rounded-[5px] shadow shadow-[#BCBCC9]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 30
              }}
              >
                <h1 className="text-lg font-medium text-[#242F5C] p-4">
                  My Account
                </h1>
                <hr className="w-[100%] h-[1px] bg-[#CDCDE5] border-none rounded-full" />
                
                <ProfileInfo onClick={() => router.push(`/Profile/${userData.username}`)} />


                <ProfileSetting />
                <hr className="w-[100%] h-[1px] bg-[#CDCDE5] border-none rounded-full" />
                <LogoutProfile setUserData={setUserData} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
