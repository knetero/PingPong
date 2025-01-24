import Image from "next/image";
import { DashContext } from "./Dashcontext";
import { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Loading from "../../components/Loading";
import axios from "axios";
import { IconHistory } from "@tabler/icons-react"


function Achievements() {
  const DashData = useContext(DashContext);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/achievements');
        setAchievements(response.data);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        setAchievements([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  return (
    <motion.div
      className={`${!DashData.isMobile
        ? "shadow-md shadow-[#BCBCC9] rounded-3xl border-[#BCBCC9] bg-[#F4F4FF] md:w-[70%] md:h-[48%] lg:w-[800px] lg:h-[500px] w-[90%] h-[48%] ml-[5%] mt-[50px] mr-[5%]"
        : "shadow-md shadow-[#BCBCC9] border-[#BCBCC9]/25 border-solid bg-[#F4F4FF]/75 rounded-3xl border-[#BCBCC9] bg-[#F4F4FF]md:w-[70%] md:h-[48%] lg:w-[800px] lg:h-[500px] w-[90%] h-[30%] ml-[5%] mt-[50px] mr-[5%]"
      } motion-preset-pop `}
    >
      <div className="animation-wrapper">
        <h1 className="text-[#444E74] mb-5 h-[18%] font-black text-center pt-5 tracking-wider lg:text-4xl md:text-3xl text-lg md:text-xl lg:text-2xl">
          ACHIEVEMENTS
        </h1>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-6 lg:gap-4 justify-items-center max-h-[70%] overflow-y-auto overflow-hidden custom-scrollbar">
        {isLoading ? (
          <div className="col-span-3 flex justify-center items-center py-10">
            <Loading />
          </div>
        ) : achievements.length === 0 ? (
          <div className="col-span-3 flex flex-col gap-3 justify-center items-center py-10 text-center">
            <IconHistory className="w-8 h-8 text-[#4E5981] animate-pulse" />
            <div className="flex flex-col gap-1">
              <p className="text-[#4E5981] font-semibold text-lg">No Achievements Yet!</p>
              <p className="text-[#6B7280] text-sm">
                Keep playing to unlock awesome achievements !
              </p>
            </div>
          </div>
        ) : (
          achievements.map((achievement, index) => (
            <div key={index} className="w-full aspect-square flex items-center justify-center">
              <Image
                src={achievement.src}
                alt={achievement.alt}
                width={100}
                height={100}
                className={`w-[50%] sm:w-[70%] max-w-[80px] md:max-w-[90px] lg:max-w-[100px] h-auto object-contain ${
                  !achievement.unlocked ? 'opacity-50' : ''
                }`}
              />
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default Achievements;