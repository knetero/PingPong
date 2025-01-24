"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import customAxios from '../../customAxios'
import { useWebSocket } from '../../contexts/WebSocketProvider';
import {IconUserExclamation} from '@tabler/icons-react'
import { useUser } from '../../contexts/UserContext';
import { useRouter } from 'next/navigation';

interface FriendRequestProps {
  request: {
    freindship_id: number;
    is_accepted: boolean;
    user: {
      id: number;
      username: string;
      is_on: number;
      image_field: string
    };
    user_from: number;
    user_to: number;
    user_is_logged_in: number;
  }
}

export default function FriendRequests({ request }: FriendRequestProps) {
  const { userData } = useUser();
  const [isMobileRq, setIsMobileRq] = useState(false)
  const router = useRouter();
  
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState({
    accept: false,
    reject: false
  })
  const [error, setError] = useState<string | null>(null)
  const { send} = useWebSocket();

  const handleAccept = async () => {
    if (isLoading.accept) return;
    setError(null);
    setIsLoading(prev => ({ ...prev, accept: true }));
    try {

      send({
        type: 'friend-accept',
        freindship_id: request.freindship_id,
        user: request.user,
        user_from: request.user_from,
        user_to: request.user_to,
        user_is_logged_in: request.user_is_logged_in
      });
    } catch (error) {
      console.error('Error accepting friend request:', error)
      setError('Failed to accept friend request. Please try again.')
    } finally {
      setIsLoading(prev => ({ ...prev, accept: false }))
    }
  }

  const handleReject = async () => {
    if (isLoading.reject) return;
    setError(null);
    setIsLoading(prev => ({ ...prev, reject: true }));
    try {

      send({
        type: 'friends-reject',
        freindship_id: request.freindship_id,
        user: request.user,
        user_from: request.user_from,
        user_to: request.user_to,
        user_is_logged_in: request.user_is_logged_in
      });
    } catch (error) {
      console.error('Error rejecting friend request:', error)
      setError('Failed to reject friend request. Please try again.')
    } finally {
      setIsLoading(prev => ({ ...prev, reject: false }))
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobileRq(window.innerWidth <= 1700)
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const getProfile = (username: string) => {
    router.push(`/Profile/${username}`);
  };

  return (
    <div className={`w-full mx-auto h-20 lg:h-[12%] md:h-[20%] mt-2 rounded-xl bg-[#D8D8F7] shadow-md shadow-[#BCBCC9] relative ${isMobile ? '' : ' min-h-[90px]'} `}>
      {!request ? (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <IconUserExclamation size={50} className="mb-2 opacity-50" />
          <p className="text-[#7C829D] text-sm text-center">
            No pending friend requests
          </p>
        </div>
      ) : (
        isLoading.accept || isLoading.reject ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#242F5C]"></div>
          </div>
        ) : (
          <div className="flex items-center h-full p-2" key={request.user.id}>
            <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-15 lg:h-15">
              <img
                src={request.user.image_field ? `https://10.13.7.8/api/api${request.user.image_field}` : "/images/DefaultAvatar.svg"}
                alt={`${request.user.username}'s profile`} 
                className="w-full h-full rounded-full object-cover border-2 border-[#BCBCC9] cursor-pointer"
                onClick={() => getProfile(request.user.username)}
              />
            </div>
            <div className="ml-4 flex flex-col justify-center">
              <h2 className="text-[#242F5C] text-sm lg:text-lg md:text-base font-bold">{request.user.username}</h2>
              <p className={`${request.user.is_on === 1 ? 'text-green-600' : 'text-gray-500'} lg:text-sm text-xs font-medium`}>
                {request.user.is_on === 1 ? 'Online' : 'Offline'}
              </p>
            </div>
            {!isMobileRq ? (
              <div className="flex flex-row items-center justify-end lg:w-[50%] lg:h-[90%] md:w-[10%] md:h-[90%] w-[20%] h-[90%] absolute md:right-10 right-5 top-1 md:gap-5 gap-2">
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                <button
                  onClick={handleAccept}
                  disabled={isLoading.accept || isLoading.reject}
                  className={`
                    bottom-2 right-[8%] 
                    md:bottom-[7%] 
                    lg:bottom-[5%] lg:right-[4%]
                    text-base tracking-wide
                    bg-[#242F5C] text-white px-4 py-2 rounded-[8px] 
                    ${(isLoading.accept || isLoading.reject) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1a2340]'}
                    transition-colors
                  `}
                >
                  {isLoading.accept ? 'Accepting...' : 'Accept'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={isLoading.accept || isLoading.reject}
                  className={`
                    bg-red-500 text-white px-4 py-2 rounded-[8px] 
                    ${(isLoading.accept || isLoading.reject) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}
                    transition-colors
                  `}
                >
                  {isLoading.reject ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            ) : (
              <div className="flex flex-row items-center justify-end lg:w-[30%] lg:h-[90%] md:w-[30%] md:h-[90%] w-[30%] h-[90%] absolute md:right-4 lg:right-12 right-5 top-1 md:gap-8 gap-5">
                <button onClick={handleAccept} aria-label={`Accept friend request from ${request.user.username}`}>
                  <Image src="/images/Accept.svg" alt="Accept" width={150} height={150} className="lg:w-[100%] lg:h-[100%] md:w-[90%] md:h-[90%] w-[80%] h-[80%] cursor-pointer" />
                </button>
                <button onClick={handleReject} aria-label={`Reject friend request from ${request.user.username}`}>
                  <Image src="/images/Reject.svg" alt="Reject" width={150} height={150} className="lg:w-[100%] lg:h-[100%] md:w-[90%] md:h-[90%] w-[80%] h-[80%] cursor-pointer" />
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  )
}