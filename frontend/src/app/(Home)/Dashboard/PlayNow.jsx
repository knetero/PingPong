import Image from "next/image";
import { DashContext } from "./Dashcontext";
import { useContext, useState} from "react";
import { motion } from "framer-motion"
import { useRouter } from 'next/navigation';




function PlayNow() {
  const DashData = useContext(DashContext);
  const [imageLoading, setImageLoading] = useState(true);
  const router = useRouter();
  
  const handlePlay = () => {
    router.push('/Game');
  }
  
  return (
    <motion.div
 
      className={` ${!DashData.isMobile
          ? "bg-[#F4F4FF] drop-shadow-md rounded-3xl border-[#BCBCC9] mt-10 shadow-md shadow-[#BCBCC9] md:h-[48%] lg:w-[800px] lg:h-[500px] "
          : "min-h-[235px]"
        } w-[90%] h-[25%] relative p-4 flex flex-col justify-center items-center motion-preset-pop `}
    >
      <div className="w-full h-[80%] relative mb-4 ">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center border-[#242F5C] rounded-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#242F5C]"></div>
            </div>
          )}
        <Image
          src="/images/playNow.webp"
          alt="Game Image"
          fill
          className="object-contain rounded-xl"
          sizes="100%"
          onLoad={() => setImageLoading(false)}
          priority
        />
      </div>
      <button 
      onClick={handlePlay}
      className="absolute 
                bottom-2 right-[8%] 
                md:bottom-[7%] 
                lg:bottom-[5%] lg:right-[4%]
                py-2 px-4 
                md:py-2 md:px-4 
                lg:py-3 lg:px-8 
                bg-[#242F5C] rounded-full cursor-pointer overflow-hidden 
                transition-all duration-500 ease-in-out shadow-md 
                hover:scale-105 hover:shadow-lg 
                before:absolute before:top-0 before:-left-full before:w-full before:h-full 
                before:bg-gradient-to-r before:from-[#242F5C] before:to-[#7C829D] 
                before:transition-all before:duration-500 before:ease-in-out before:z-[-1] 
                font-extrabold before:rounded-xl hover:before:left-0 text-[#fff]" >
                  
        PLAY NOW
      </button>
    </motion.div>
  )
}

export default PlayNow;