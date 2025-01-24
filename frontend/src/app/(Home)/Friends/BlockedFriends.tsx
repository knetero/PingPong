"use client"

import Image from "next/image"
import { Montserrat } from "next/font/google"
import { useState, useEffect } from "react"
import customAxios from '../../customAxios'
import { useWebSocket } from '../../contexts/WebSocketProvider';
import {IconUserCancel} from '@tabler/icons-react'
import { useUser } from '../../contexts/UserContext';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

interface BlockedFriendProps {
  blockedFriend: {
    user: {
      id: number;
      username: string;
      is_on: number;
      image_field: string
    };
    freindship_id: number;
    is_accepted: boolean;
    user_from: number;
    user_to: number;
    user_is_logged_in: number;
  }
}

export default function BlockedFriends({ blockedFriend }: BlockedFriendProps) {
  const [isMobile, setIsMobile] = useState(false)
  const { userData } = useUser();
  const { send } = useWebSocket();

  const handleUnblock = async () => {
    try {
      send({
        type: 'friends-unblock',
        freindship_id: blockedFriend.freindship_id,
        user: blockedFriend.user,
        user_from: blockedFriend.user_from,
        user_to: blockedFriend.user_to,
        user_is_logged_in: blockedFriend.user_is_logged_in
      });
    } catch (error) {
      console.error('Error unblocking friend:', error)
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div 
      key={blockedFriend.freindship_id}
      className={`w-full mx-auto h-20 lg:h-[12%] md:h-[20%] mt-2 rounded-xl bg-[#D8D8F7] shadow-md shadow-[#BCBCC9] relative ${isMobile ? '' : ' min-h-[90px]'} ${montserrat.className}`}
    >
      <div className="flex items-center h-full p-2">
        <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-15 lg:h-15">
          <img
            src={blockedFriend.user.image_field ? `https://10.13.7.8/api/api${blockedFriend.user.image_field}` : "/images/DefaultAvatar.svg"}
            alt={`${blockedFriend.user.username}'s profile`} 
            className="w-full h-full rounded-full object-cover border-2 border-[#BCBCC9]"
          />
        </div>
        <div className="ml-4 flex flex-col justify-center">
          <h2 className="text-[#242F5C] text-sm lg:text-lg md:text-base font-bold">{blockedFriend.user.username}</h2>
          <p className={`${blockedFriend.user.is_on === 1 ? 'text-green-600' : 'text-gray-500'} lg:text-sm text-xs font-medium`}>
            {blockedFriend.user.is_on === 1 ? 'Online' : 'Offline'}
          </p>
        </div>
        <div className="flex flex-row items-center justify-end lg:w-[50%] lg:h-[90%] md:w-[10%] md:h-[90%] w-[20%] h-[90%] absolute md:right-10 right-5 top-1 md:gap-5 gap-2">
          <button
            onClick={handleUnblock}
            className="bg-[#242F5C] rounded-[12px] text-white px-4 py-2 rounded-lg hover:bg-[#1a2340] transition-colors"
          >
            Unblock
          </button>
        </div>
      </div>
    </div>
  )
}