import Image from "next/image";
import { DashContext } from "../../Dashboard/Dashcontext";
import { useContext } from "react";
import { motion } from "framer-motion"
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../../../components/Loading";
import { IconHistory } from "@tabler/icons-react"
// import {useUser} from '../../../contexts/UserContext';


function MatchHistory({user}) {
  const DashData = useContext(DashContext);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
//   const { user } = useUser();

  useEffect(() => {
    const fetchAllMatches = async () => {
      try {
        setIsLoading(true);
        
        // Fetch from both APIs in parallel
        const [normalMatchesResponse, aiMatchesResponse] = await Promise.all([
          axios.get(`https://10.13.7.8/api/game/fetch_history/${user.username}/`),
          axios.get(`https://10.13.7.8/api/game/matches/${user.username}/`)
        ]);

        const normalMatches = normalMatchesResponse.data;
        const aiMatches = aiMatchesResponse.data;


        const allMatches = [...normalMatches, ...aiMatches].sort((a, b) => 
          new Date(b.date_time || b.date) - new Date(a.date_time || a.date)
        );

        setMatches(allMatches);
      } catch (error) {
        console.error('Error fetching match history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllMatches();
  }, [user]);

  return (
    <div
      className={`${!DashData.isMobile
          ? "shadow-md shadow-[#BCBCC9] rounded-3xl border-[#BCBCC9] bg-[#F4F4FF] w-[90%] md:w-[70%] h-[48%] md:h-[400px] lg:w-full lg:h-[500px] ml-[5%] mt-[50px] mr-[5%]"
          : "shadow-md shadow-[#BCBCC9] rounded-3xl bg-[#F4F4FF]/75 border-[#BCBCC9]/25 bg-[#F4F4FF] w-[90%] h-[30%] ml-[5%] mt-[50px] mr-[5%]"
        } motion-preset-slide-right  `}
    >
      <motion.h1 className="text-[#444E74]  h-[18%] font-black text-center pt-5 tracking-wider lg:text-4xl md:text-3xl text-lg md:text-xl lg:text-2xl "

      >
        MATCH HISTORY
      </motion.h1>
      <div className="flex flex-col justify-content overflow-auto overflow-y-scroll custom-scrollbar h-[95%]">
        <div className="flex flex-col aspect-square overflow-y-auto gap-2 overflow-hidden">
          <div
            className={`flex flex-col w-full px-2 py-1 overflow-y-auto overflow-hidden custom-scrollbar pr-[5%] h-[80%] transition-all duration-300 ${DashData.isScrolled
                ? "bg-white/30 backdrop-blur-lg backdrop-filter"
                : "bg-transparent"
              }`}
          >
            <table className="w-full">
              <thead>
                {!DashData.isMobile ? (
                  <tr className="text-center font-semibold text-xs sm:text-sm md:text-base lg:text-lg text-[#4E5981]">
                    <th className="font-extrabold py-2 sm:py-3 md:py-4">
                      Opponent
                    </th>
                    <th className="font-extrabold py-2 sm:py-3 md:py-4">
                      Score
                    </th>
                    <th className="font-extrabold py-2 sm:py-3 md:py-4">
                      Winner
                    </th>
                    <th className="font-extrabold py-2 sm:py-3 md:py-4">Date</th>
                  </tr>
                ) : (
                  <tr className="text-center font-semibold text-xs sm:text-sm md:text-base lg:text-lg text-[#4E5981]">
                    <th className="font-extrabold py-2 sm:py-3 md:py-4">O</th>
                    <th className="font-extrabold py-2 sm:py-3 md:py-4">S</th>
                    <th className="font-extrabold py-2 sm:py-3 md:py-4">W</th>
                    <th className="font-extrabold py-2 sm:py-3 md:py-4">D</th>
                  </tr>
                )}
              </thead>
              <tbody className="py-4 sm:py-6 md:py-8">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <div className="flex justify-center items-center py-10">
                        <Loading />
                      </div>
                    </td>
                  </tr>
                ) : matches.length === 0  || matches === undefined? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <div className="flex flex-col gap-3 justify-center items-center py-10 text-center">
                        <IconHistory className="w-8 h-8 text-[#4E5981] animate-pulse" />
                        <div className="flex flex-col gap-1">
                          <p className="text-[#4E5981] font-semibold text-lg">No Matches Yet!</p>
                          <p className="text-[#6B7280] text-sm">
                            Start playing to build your match history !
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  matches.map((match, index) => (
                    <tr
                      key={index}
                      className="text-center font-semibold text-xs sm:text-sm md:text-base lg:text-lg text-[#4E5981]"
                    >
                      <td className="font-normal py-2 sm:py-3 md:py-4">
                        {match.player1 ? (match.player1 === user.username ? match.player2 : match.player1) : (match.player1_username === user.username ? match.player2_username : match.player1_username)}
                      </td>
                      <td className="font-normal py-2 sm:py-3 md:py-4">
                        {match.player1 ? (match.player1 === user.username ? match.player2_score : match.player1_score) : (match.player1_username === user.username ? match.player2_score : match.player1_score)}
                      </td>
                      <td className="font-normal py-2 sm:py-3 md:py-4">
                        {match.player1 ? (match.winner === "player1" ? match.player1 : match.player2) : (match.winner === "player1" ? match.player1_username : match.player2_username)}
                        </td>
                      <td className="font-normal py-2 sm:py-3 md:py-4">
                        {new Date(match.date_time || match.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        })}
                        </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchHistory;
