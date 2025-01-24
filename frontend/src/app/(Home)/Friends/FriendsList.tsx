'use client'

import Image from "next/image";
import { Montserrat } from "next/font/google";
import { useState, useEffect } from "react";
import { useWebSocket } from '../../contexts/WebSocketProvider';
import customAxios from '../../customAxios';
import {IconUserExclamation} from '@tabler/icons-react'
import { useRouter } from "next/navigation";
import { useUser } from '../../contexts/UserContext';
import { toast } from 'react-hot-toast';
import { useGameInviteWebSocket } from '../../contexts/GameInviteWebSocket';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

interface Friend {
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

interface FriendsListProps {
  friends: Friend[];
}

export default function FriendsList({ friends = [] }: FriendsListProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { userData } = useUser();
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({});
  const { send } = useWebSocket();
  const { send: sendGame } = useGameInviteWebSocket();

  const router = useRouter();



  const handleChat = async (friend: Friend) => {
    router.push("/Chatt");
  };

  const handleBlock = async (friend: Friend) => {
    try {

      send({
        type: 'friends-block',
        freindship_id: friend.freindship_id,
        user: friend.user,
        user_from: friend.user_from,
        user_to: friend.user_to,
        user_is_logged_in: friend.user_is_logged_in
      });

    } catch (error) {
      console.error('Error blocking friend:', error);
    }
  };

  

  const getProfile = (username: string) => {
    router.push(`/Profile/${username}`);
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

  const handleImageLoad = (friendId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [friendId]: false }));
  };

  const handleGameInvite = (friendshipId: number, friendUsername: string) => {

      const message = {
        type: 'game_invitation',
        friendship_id: friendshipId,
        map: "White Map",
        sender_username: userData.username,
        sender_image: userData.image_field,
        receiver_username: friendUsername,
        timestamp: new Date().toISOString()
      };
      sendGame(message);
      toast.success(`Invitation sent to ${friendUsername}!`);
    };
  

  return (
    <div className={`w-full mx-auto space-y-2 ${montserrat.className}`}>
      {friends.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full h-[200px] p-4">
          <IconUserExclamation size={50} color="#242F5C" />
          <h3 className="text-[#242F5C] text-lg font-bold mb-2">No Friends Yet</h3>
          <p className="text-[#7C829D] text-sm text-center">
            You don&apos;t have any friends in your list yet.<br/>
            Start by accepting friend requests or adding new friends!
          </p>
        </div>
      ) : (
        friends.map((friend) => (
          <div  key={friend.user.id} className={`w-full h-20 lg:h-[12%] cursor-pointer md:h-[15%] md:h-[20%] rounded-xl bg-[#D8D8F7] shadow-md shadow-[#BCBCC9] relative ${isMobile ? 'w-full' : 'min-h-[90px]'}`}>
            <div className="flex items-center h-full p-2">
              <div className="relative w-16  h-16 md:w-20 md:h-20 lg:w-15 lg:h-15">
                <img
                  src={friend.user.image_field ? `https://10.13.7.8/api/api${friend.user.image_field}` : "/images/DefaultAvatar.svg"}
                  alt={`${friend.user.username}'s profile`}
                  width={80}
                  height={80}
                  className="w-full h-full rounded-full object-cover border-2 border-[#BCBCC9] cursor-pointer"
                  onClick={() => getProfile(friend.user.username)}
                />
                {friend.is_accepted === false && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">1</span>
                  </div>
                )}
              </div>
              <div className="ml-4 flex flex-col justify-center">
                <h2 className="text-[#242F5C] text-sm lg:text-lg md:text-base font-bold">{friend.user.username}</h2>
                <p className={`${friend.user.is_on === 1 ? 'text-green-600' : 'text-gray-500'} lg:text-sm text-xs font-medium`}>
                  {friend.user.is_on === 1 ? 'Online' : 'Offline'}
                </p>
              </div>
              <div className="flex flex-row items-center justify-end lg:w-[90%] lg:h-[90%] md:w-[90%] md:h-[90%] w-[90%] h-[90%] absolute md:right-10 right-5 top-1 lg:gap-12 md:gap-4 gap-4">
                <button 
                  onClick={() => handleChat(friend)}
                  aria-label={`Chat with ${friend.user.username}`} 
                  className="cursor-pointer hover:scale-110 transition-transform"
                >
                  <Image src="/images/chat.svg" alt="" width={50} height={50} className="lg:w-[40px] lg:h-[40px] md:w-[30px] md:h-[30px] w-[30px] h-[30px]" />
                </button>
                <button 
                  onClick={() => handleGameInvite(friend.freindship_id, friend.user.username)}
                  aria-label={`Unfriend ${friend.user.username}`} 
                  className="cursor-pointer hover:scale-110 transition-transform"
                >
                  <Image src="/images/inviteGame.svg" alt="" width={50} height={50} className="lg:w-[40px] lg:h-[40px] md:w-[30px] md:h-[30px] w-[30px] h-[30px]" />
                </button>
                <button 
                  onClick={() => handleBlock(friend)}
                  aria-label={`Block ${friend.user.username}`} 
                  className="cursor-pointer hover:scale-110 transition-transform"
                >
                  <Image src="/images/BlockedFriends.svg" alt="" width={50} height={50} className="lg:w-[40px] lg:h-[40px] md:w-[30px] md:h-[30px] w-[30px] h-[30px]" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}