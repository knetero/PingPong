// import { div } from "framer-motion/client";
// import { DashContext } from "../../Dashboard/Dashcontext";
// import { useContext } from "react";
"use client";
import { BsChatLeftText } from "react-icons/bs";
import { MdOutlinePersonAddAlt } from "react-icons/md";
import { LuUserX } from "react-icons/lu";
import axios from "axios";
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';



// import { DashContext } from "../../Dashboard/Dashcontext";
// import { useContext } from "react";
// -- colors -----------------------------------------------------co
//  #F4F4FF   #242F5C   #8988DE   #BCBCC9   #F4F4FF   #EAEAFF   #C0C7E0







const handleTextUser = (router) => {
  
  router.push(`/Chatt`);
}


const handleAddFriend = async (loggedInUser, user) => {
  try {
    const respond = await axios.post(
      "https://10.13.7.8/api/friend/friends-add/", 
      { username: user.username },
      { withCredentials: true, headers: {} }
    );

    // console.log("Response:", respond);

    // Check if the response contains a success message
    if (respond.status === 200 && respond.data?.success) {
      toast.success(respond.data.success); // Display the success message in the toast
    } else {
      toast.error('Friend request failed'); // Handle unexpected cases
    }
  } catch (error) {
    console.error(error);
    toast.error('An error occurred while sending the friend request');
  }
};


const handleBlockUser = async (loggedInUser, user) => {
  try {
    const respond = await axios.post(
      "https://10.13.7.8/api/friend/friends-remove/",
      { username: user.username },
      { withCredentials: true, headers: {} }
    );

    // console.log("respond : ---------------", respond);

    // Check if the response contains a success message
    if (respond.status === 200 && respond.data?.success) {
      toast.success(respond.data.success); // Display the success message from the backend
    } else {
      toast.error('Blocking user failed'); // Handle unexpected cases
    }
  } catch (error) {
    console.error(error);
    toast.error('An error occurred while blocking the user');
  }
};


function Part1({loggedInUser, user, isSelf}) {

  const router = useRouter();
  return (
    <div className="part1 relative w-1/3 p-2 rounded-l-2xl bg-[#F4F4FF] border-[#BCBCC9] border-r-2 min-w-32 ">


    <div className="flex flex-col items-center">
        <img
            src={user?.image_field? `https://10.13.7.8/api/api/images/${user.image_field}` : "/images/DefaultAvatar.svg"} // image_feiled
            alt="ProfileImage"
            width={60}
            height={60}
        
        // alt="Profile"
        className="absolute w-20 h-20 rounded-full border-2 border-[#BCBCC9] -top-10  shadow-md shadow-[#BCBCC9]"
        />

      <div className="mt-12 text-sm md:text-md lg:text-lg xl:text-xl font-bold text-[#242F5C]">
        {user.username}
      </div>
      <span className="text-xs   mt-1 text-[#8988DE] font-semibold">{user.is_on  ? "Online" : "Offline"}</span>
      <div className={`flex flex-row mt-2 text-[#242F5C] ${(isSelf === true || user.username === "bot") ? "invisible" : "visible"}`}>
        <BsChatLeftText className="textUser mr-1 text-lg lg:text-xl cursor-pointer" onClick={() => handleTextUser(router)}/>
        <MdOutlinePersonAddAlt className="addFriend ml-1 text-xl lg:text-2xl cursor-pointer" onClick={() => handleAddFriend(loggedInUser, user)}/>
      </div>
    </div>
  </div>
  );
}

       
function Part2({loggedInUser, user, isSelf}) {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  
  const calculateLevel = (xp) => {
    if(xp > 1900) return 20;
    return Math.floor(xp / 100) + 1;
  };

  const calculateProgress = (level) => {

    return (level / 20 ) * 100;  ; 
  };

  useEffect( () => {
    const fetchXp = async () => {
      try {
        const [normalMatchesResponse, aiMatchesResponse] = await Promise.all([
          axios.get(`https://10.13.7.8/api/game/fetch_history/${user.username}/`),
          axios.get(`https://10.13.7.8/api/game/matches/${user.username}/`)
        ]);

        const normalMatches = normalMatchesResponse.data || [];
        const aiMatches = aiMatchesResponse.data || [];
        const allMatches = [...normalMatches, ...aiMatches];
  
        const totalXp = allMatches.reduce((acc, match) => {
          if (match.winner === user.username) {
            return acc + 50; 
          }
          return acc + 15; 
        }, 0);
        setXp(totalXp);



        const userLevel = calculateLevel(totalXp);
        setLevel(userLevel);

      } catch (error) {
        console.error("Error fetching level:", error);
      }
    };
    fetchXp();
  }, []);

  const progress = calculateProgress(level);
  return (
      <div className="part2 w-2/3 p-4 flex flex-col items-end ml-auto   overflow-hidden">

      <LuUserX  
      onClick={() => handleBlockUser(loggedInUser, user)}
      className={`blockUser text-[#242F5C] text-3xl ${(isSelf === true || user.username === "bot")? "invisible" : "visible"} cursor-pointer`} />

      <div className="level flex flex-col items-start w-full mb-4">
        <span className=" text-[#242F5C] font-semibold text-xs ">Level {level}</span>

        
        <div className="relative w-full h-3 bg-gray-300 rounded-full mt-1 ">
          
          <div
            className="absolute top-0 left-0 h-3 bg-[#8988DE] rounded-full  "
            style={{ width: `${progress}%` }}
            // style={{ width: '50%' }}
          >  </div>
        </div>

        
        <div className="flex justify-between w-full mt-1 text-[#242F5C] text-xs ">
          <span >Next level</span>
          {level === 20 ? 'You reached the max level!' : `Level ${level + 1}`}
        </div>


      </div>
      <button className="gameStats bg-[#242F5C] p-1  px-2 text-[#F4F4FF] text-xs rounded-full font-semibold">
       Xp :  {xp}
      </button>
    </div>
  )
}

export default function UserProfile({loggedInUser, user, isSelf}) {




    if(!user || !loggedInUser)
      return  null;

    return (
    <div className="flex shadow-md shadow-[#BCBCC9] border border-[#BCBCC9] rounded-2xl bg-[#F4F4FF] h-40 w-[80%] mt-10">
      <Toaster /> 
      <Part1 loggedInUser={loggedInUser} user={user} isSelf={isSelf}/>
      <Part2  loggedInUser={loggedInUser} user={user} isSelf={isSelf}/>

    </div>
  );
}
