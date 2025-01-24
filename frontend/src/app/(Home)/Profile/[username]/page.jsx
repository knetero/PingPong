"use client";



import MatchHistory from "./CustomMatchHistory";
import { DashContext } from "../../Dashboard/Dashcontext";
import { useContext } from "react"; // Import DashProvider





import UserProfile from "./components/UserProfile";
import LeaderBoard from "./components/LeaderBoard";

import { useParams } from 'next/navigation'; 
import axios from "axios";
import { useEffect, useState } from "react";

import { Inter, Montserrat } from "next/font/google";
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

import { useUser } from "../../../contexts/UserContext";
// //data ------------------------------------------
let user1 = {
  "userName": "john",
  "userId": 1,
  "name" : "John Doe",
  "avatar": "/images/avatarprofile.svg",
  "status": "Online",
  "level": 1,
  "score": "5-4",
  "result": "Win",
  "map": "Blue"
};

let user2 = {
  "userName": "lucy",
  "userId": 2,
  "name" : "lucy wilimas",
  "avatar": "/images/avatar3.svg",
  "status": "Offline",
  "level": 2,
  "score": "5-4",
  "result": "Win",
  "map": "Blue"
};

let user3 = {
  "userName": "malcom",
  "userId": 3,
  "name" : "Malcom smith",
  "avatar": "/images/avatarprofile.svg",
  "status": "Offline",
  "level": 1,
  "score": "3-4",
  "result": "Lose",
  "map": "Blue"
};


export default function Profile() {
  // const [isMatchHistoryLoaded, setIsMatchHistoryLoaded] = useState(false);

  // // Use a callback to update the loading state when matches are available
  // const handleMatchHistoryLoaded = (isLoaded) => {
  //   setIsMatchHistoryLoaded(isLoaded);
  // };

  // loggedInUser -----------------------------------------------------------------------------------



  
  const LoggedInUser = useUser();

  let [loggedInUser, setLoggedInUser] = useState(
    {
      userName: "",
      userId: 10,
      name: "",
      avatar: "/images/avatarprofile.svg",
      status: "Online",
      level: 1,
      score: "",
      result: "",
      map: "",
    }
  );

  
  useEffect(() => {

    if (LoggedInUser.userData !== null) {

      const filledUser = {
        userName: LoggedInUser.userData.username || '',   
        userId: LoggedInUser.userData.id || null,        
        name: LoggedInUser.userData.username || 'Unknown', 
        avatar: "/images/avatarprofile.svg", 
        status: 'Online', 
        level: 0,
        score: "",
        result: "",
        map: "",
      };
  
      setLoggedInUser(filledUser);


    }
  }, []); 

 




  // searchedText - Searched user from the URL -------------------------------------------------------
  const params = useParams();
  const searchedText = params.username;
  const DashData = useContext(DashContext);


  const [userSearchedFor, setUserSearchedFor] = useState(null);
  const [tracker, setTracker] = useState(false);
  useEffect(() => {
    const fetchuserSearchedFor = async () => 
    {
      try 
      {
      
        const response = await axios.get('https://10.13.7.8/api/api/users/', {   withCredentials: true, headers: {} });
        const usersArray = Object.values(response.data);


        const user = usersArray.find( (u) => u.username === searchedText );
        if(user )
        {
          setUserSearchedFor(user);
          
        }
        else 
        {
          setUserSearchedFor(null);
          setTracker(true)
        }

      } catch (error)
      {
        console.error("Error user data in profile page ...", error);

      }


      
    };
    fetchuserSearchedFor();
  
  }, [searchedText]);

  useEffect(() => {
    const handleResize = () => {
      DashData.setIsMobile(window.innerWidth <= 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
  }, [DashData]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        DashData.setIsScrolled(true);
      } else {
        DashData.setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });





  if(loggedInUser === null) {
    return null;
  }

  if (userSearchedFor === null && tracker === true) {
    return (

        <div className="text-center p-8 rounded-xl shadow-xl bg-[#F4F4FF] border border-[#C0C7E0] max-w-md mx-4">
          <h1 className="text-3xl font-extrabold text-[#242F5C] mb-4">Oops!</h1>
          <p className="text-lg text-[#242F5C] mb-6">
          We couldn&apos;t find the user you&apos;re looking for. Please double-check the username or try again.
            
          </p>
        </div>
    );
  }

  let isSelf = loggedInUser && loggedInUser.userName === searchedText;

  
   
  return (
      <div
        className={`flex-1 overflow-y-auto p-4 flex flex-wrap items-center justify-center h-full ${montserrat.variable}`}
      >
        <div className="flex flex-col lg:flex-row w-full  items-center justify-center lg:gap-10 xl:gap-32 2xl:gap-60      lg:mx-10 xl:mx-28 2xl:mx-40">
          {userSearchedFor && (<UserProfile loggedInUser={loggedInUser} user={userSearchedFor} isSelf={isSelf}/>)}
          
          {/* <LeaderBoard first={user3} second={user2} third={user3} /> */}
        </div>
        
        {userSearchedFor && <MatchHistory user={userSearchedFor} />}
      </div>
  );
}
