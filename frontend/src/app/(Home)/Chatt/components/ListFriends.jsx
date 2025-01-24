"use client";
import { useState, useEffect} from "react";
import Image from "next/image";
import customAxios from "../../../customAxios"
import { Skeleton}  from "../../../../compo/ui/Skeleton";

import { useUser } from '../../../contexts/UserContext';

export default function ListFriends({ getSelectedFriend, switchChatState }) {
    const { userData, isLoading, setUserData } = useUser();

    const [friendsList, setFriendsList] = useState([]);



    // Fetching friends with Axios
    useEffect(() => {
        const fetchFriends = async () => {
        try {
            const response = await customAxios.get("https://10.13.7.8/api/friend/friends",);
            setFriendsList(response.data); // Assuming the API returns { friends: [...] }
        } catch (error) {
            console.error("Error fetching friends data:", error);
        }
        };

        fetchFriends();
    }, []);


    
    if (friendsList && friendsList.length === 0) {
        return <p className="text-center text-gray-500">loading friends ...</p>;
    }





    return (
        <div className="friendsList">

        {friendsList && friendsList.map((friend) => (

            <div 
            key={friend.user.id} 
            className="friendInfo my-2 px-1 w-full flex flex-row items-center overflow-hidden cursor-pointer" 
            onClick={() =>{ getSelectedFriend(friend); switchChatState()}} >
            
            

                {isLoading ? (
                    <>
                    <Skeleton className="sm:w-10 sm:h-10 w-8 h-8 rounded-full bg-[#d1daff]" />
                    </>
                    ) : (
                    <img
                    id="avatarButton"
                    className="rounded-full left-0 top-0 w-[45px] h-[45px]"
                    src={friend.user.image_field ? `https://10.13.7.8/api/api${friend.user.image_field}`  : "/images/DefaultAvatar.svg"}
                    alt="profileImage"
                    width={45}
                    height={45}
                    /> 
                    )
                }



                <h3 className="text-xl xl:text-2xl top-0 left-0 text-[#242F5C] ml-2 ">{friend.user.username}</h3>

                <div
                    className={`text-xs ${friend.user.is_online ? "bg-green-500" : "bg-gray-300"} ml-auto hidden lg:block rounded-full w-2 h-2`}
                ></div>



            </div>
        ))}


        </div>
    );
}