
import Image from "next/image";

import { useUser } from '../../../contexts/UserContext';
import { Skeleton}  from "../../../../compo/ui/Skeleton";


export default function ProfileInfo({ avatar, name, status }) {
  const { userData, isLoading, setUserData } = useUser();
  // console.log("name : ", name);
    return (
      <div className="profileInfo  w-full flex items-center overflow-hidden py-2 pl-2 ">
        {/* <Image
          src={avatar === undefined || avatar === null || avatar === "" 
            ? "/images/avatarprofile.svg" 
            : avatar}
          alt="avatarprofile"
          width={60}
          height={60}
          className="left-0 top-0 w-[60px] h-[60px] "
        /> */}
        {isLoading ? (
              <>
              <Skeleton className="sm:w-10 sm:h-10 w-8 h-8 rounded-full bg-[#d1daff]" />
            </>
            ) : (
            <img
              id="avatarButton"
              className="left-0 top-0 w-[60px] h-[60px] rounded-full"
              src={userData?.image_field ? `https://10.13.7.8/api/api${userData.image_field}` : "/images/Default_profile.png"}
              alt="User dropdown"
              width={60}
              height={60}
              /> 
            )
              }
        <div className=" ml-4  ">
          <h3 className="text-lg xl:text-xl 2xl:text-3xl top-0 left-0 text-[#242F5C] ">
            {name}
          </h3>
          <p className="text-sm text-[#302FA5] left">User ID : {status}</p>
        </div>
      </div>
    );
  }




  