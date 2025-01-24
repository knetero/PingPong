'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { IconLaurelWreath, IconTrophy, IconConfetti } from '@tabler/icons-react';
import { useUser } from '../contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

const VictoryPopup = ({ winner, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
    >
      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 100 }}
        className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4 overflow-hidden shadow-xl border-2 border-[#242F5C]"
      >
        {/* Content container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col items-center text-center"
        >
          {/* Top decoration line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#242F5C]"></div>

          {/* Trophy with winner animation */}
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="relative mt-6"
          >
            <IconTrophy className="w-24 h-24 text-[#242F5C]" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 space-y-4"
          >
            <h2 className="text-3xl font-bold text-[#242F5C] mb-4">
              Tournament Champion!
            </h2>
            
            {/* Winner card - styled like player cards */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-100 border-2 border-green-500 shadow-md">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <img
                  src="/images/DefaultAvatar.svg"
                  alt={winner}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xl font-semibold text-green-700">
                {winner}
              </p>
              <div className="ml-auto">
                <IconLaurelWreath className="text-green-500 w-6 h-6" />
              </div>
            </div>
          </motion.div>

          {/* Button - styled like tournament buttons */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 px-6 py-2 bg-[#242F5C] text-white rounded-lg hover:bg-opacity-90 
                     transition-colors border-2 border-[#242F5C]"
          >
            Close
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const PlayerCard = ({ player, isWinner }) => {
  const { userData } = useUser();
  // Handle both string and object formats for player
  const playerName = typeof player === 'string' ? player : player?.username;
  
  // Get profile image from userData if username matches
  const playerImage = userData && playerName === userData.username
    ? `https://10.13.7.8/api/api${userData?.image_field}`
    : "/images/DefaultAvatar.svg";

  // Check if player is actually set (not empty string)
  const isPlayerSet = playerName && playerName.trim() !== '';

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
      isWinner ? 'bg-green-100 border-2 border-green-500 shadow-md' : 'bg-white border-2 border-[#242F5C]'
    }`}>
      <div className="relative w-10 h-10 rounded-full overflow-hidden">
        <img
          src={isPlayerSet ? playerImage : "/images/DefaultAvatar.svg"}
          alt={isPlayerSet ? playerName : "TBD"}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <p className={`font-semibold ${isWinner ? 'text-green-700' : 'text-[#242F5C]'}`}>
        {isPlayerSet ? playerName : 'TBD'}
      </p>
      {isWinner && (
        <div className="ml-auto flex items-center">
          <IconLaurelWreath className="text-green-500 w-6 h-6" />
        </div>
      )}
    </div>
  );
};

const TournamentBracket = ({ tournamentData }) => {
  const { userData } = useUser();
  const [showPopup, setShowPopup] = useState(false);
  
  // Use ref to track if popup has been shown
  const popupShownRef = useRef(false);
  
  // Check winner without state updates
  const checkWinner = useCallback(() => {
    if (!tournamentData?.matches?.final?.winner_alias || !tournamentData?.matches?.final?.winner || !userData?.username) {
      return null;
    }

    if(tournamentData.matches.final.winner === userData.username)
      return tournamentData.matches.final.winner_alias;

  }, [tournamentData?.matches?.final?.winner, tournamentData?.matches?.final?.winner_alias, userData?.username]);

  // Show popup only once when there's a winner
  useEffect(() => {
    const winner = checkWinner();
    
    if (winner && !popupShownRef.current) {
      popupShownRef.current = true;
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [checkWinner]);

  // Reset popup shown ref when tournament data changes significantly
  useEffect(() => {
    if (!tournamentData?.matches?.final?.winner) {
      popupShownRef.current = false;
    }
  }, [tournamentData?.matches?.final]);

  if (!tournamentData || !tournamentData.type || tournamentData.type !== 'BRACKET_UPDATE') {
    return (
      <div className="flex flex-col items-center p-8">
        <h2 className="text-2xl font-bold text-[#242F5C] mb-8">
          Tournament Bracket
        </h2>
        <p>Loading tournament data...</p>
      </div>
    );
  }

  const { matches } = tournamentData;
  const semifinals = matches?.semifinals || {};
  const final = matches?.final || {};

  // Helper function to check if a player is the winner
  const isPlayerWinner = (match, playerName) => {
    if (!match || !match.winner) return false;
    if(match.winner === playerName) return true;
    return false;
  };

  return (
    <>
      <div className="flex flex-col items-center p-8">
        <h2 className="text-2xl font-bold text-[#242F5C] mb-8">
          Tournament Bracket
        </h2>
        
        <div className="w-full max-w-4xl">
          {/* Semi-finals */}
          <div className="flex justify-between mb-16">
            {/* Match 1 */}
            <div className="w-[45%] space-y-4">
              {semifinals.match1 && (
                <>
                  <PlayerCard 
                    player={semifinals.match1.p1_alias}
                    isWinner={isPlayerWinner(semifinals.match1, semifinals.match1.p1)}
                  />
                  <PlayerCard 
                    player={semifinals.match1.p2_alias}
                    isWinner={isPlayerWinner(semifinals.match1, semifinals.match1.p2)}
                  />
                </>
              )}
            </div>

            {/* Match 2 */}
            <div className="w-[45%] space-y-4">
              {semifinals.match2 && (
                <>
                  <PlayerCard 
                    player={semifinals.match2.p1_alias}
                    isWinner={isPlayerWinner(semifinals.match2, semifinals.match2.p1)}
                  />
                  <PlayerCard 
                    player={semifinals.match2.p2_alias}
                    isWinner={isPlayerWinner(semifinals.match2, semifinals.match2.p2)}
                  />
                </>
              )}
            </div>
          </div>

          {/* Finals */}
          <div className="w-1/2 mx-auto space-y-4">
            {final && (
              <>
                <PlayerCard 
                  player={final.p1_alias}
                  isWinner={isPlayerWinner(final, final.p1)}
                />
                <PlayerCard 
                  player={final.p2_alias}
                  isWinner={isPlayerWinner(final, final.p2)}
                />
              </>
            )}
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showPopup && checkWinner() && (
          <VictoryPopup
            winner={checkWinner()}
            onClose={() => setShowPopup(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TournamentBracket;
