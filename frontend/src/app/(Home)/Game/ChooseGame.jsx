'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from "next/link";
import { motion } from 'framer-motion';
import { Montserrat } from "next/font/google";
import { Check, X } from 'lucide-react';
import customAxios from '../../customAxios';
import TournamentBracket from "../../components/TournamentBracket";
import { gameService } from '../../services/gameService';
import { useUser } from '../../contexts/UserContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useGameInviteWebSocket } from '../../contexts/GameInviteWebSocket';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

function MainComponent() {
  const { userData } = useUser();
  const router = useRouter();
  const [showTournament, setShowTournament] = useState(false);
  const [selectedMap, setSelectedMap] = useState(null);
  const [isMode, setIsMode] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [tournamentCreator, setTournamentCreator] = useState(null);
  const [tournamentId, setTournamentId] = useState(null);
  const [showAliasPopup, setShowAliasPopup] = useState(false);
  const [alias, setAlias] = useState(''); // State variable for alias

  const [tournamentData, setTournamentData] = useState({
    type: 'BRACKET_UPDATE',
    tournamentId: null,
    matches: {
      semifinals: {
          match1: {
              p1: null,
              p1_alias: null,
              p2: null,
              p2_alias: null,
              winner: null,
              winner_alias: null
          },
          match2: {
              p1: null,
              p1_alias: null,
              p2: null,
              p2_alias: null,
              winner: null,
              winner_alias: null
          }
      },
      final: {
          p1: null,
          p1_alias: null,
          p2: null,
          p2_alias: null,
          winner: null,
          winner_alias: null
      }
  }
  });
  const [showFriendsPopup, setShowFriendsPopup] = useState(false);
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoinedTournament, setHasJoinedTournament] = useState(false);
  const { send } = useGameInviteWebSocket();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await customAxios.get('https://10.13.7.8/api/friend/friends');
        if (response.data) {
          setFriends(response.data.filter(user => user.user.username !== 'bot'));
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
        setError('Failed to load friends');
        setFriends([]);
      }
    };

    fetchFriends();
  }, []);

  useEffect(() => {
    if (userData) {
      setTournamentCreator({
        id: userData.id,
        username: userData.username,
        image_field: userData.image_field
      });
    }
  }, [userData]);

  useEffect(() => {

    const searchPar = async () => {

    
      const searchParams = new URLSearchParams(window.location.search);
      const showTournamentParam = searchParams.get('showTournament');
      const tournamentRoomParam = searchParams.get('tournamentRoom');
      

      if (showTournamentParam === 'true' && tournamentRoomParam) {
        const bracketUpdate = await customAxios.get(`https://10.13.7.8/api/game/bracket/${tournamentRoomParam}/`); 
      if(bracketUpdate.data){
        setTournamentData(bracketUpdate.data);
      }
      else{
        
      }
      setShowTournament(true);
      // Set the tournament ID from the room name
      setTournamentId(tournamentRoomParam);
    }
  };
    searchPar();
  }, []);


  useEffect(() => {
    if (!tournamentId) {
      return;
    }


    const setupListener = async () => {
      const cleanup = await gameService.setupBracketListener(tournamentId, (bracketData) => {
        let wich_map = ''
          if(bracketData.player1 === userData.username){
            wich_map = bracketData.map1
          }
          if(bracketData.player2 === userData.username){
            wich_map = bracketData.map2
          }
          if(bracketData.player3 === userData.username){
            wich_map = bracketData.map3
          }
          if(bracketData.player4 === userData.username){
            wich_map = bracketData.map4
          }
        
        if (bracketData.type === 'gamestart') {
          const params = new URLSearchParams({
            'turn-room-name': bracketData.room_name,
            player1: userData.username,
            player2: bracketData.player2,
            player3: bracketData.player3,
            player4: bracketData.player4,
            map: wich_map,
          });
          const gameUrl = `/Game/ping-pong?${params.toString()}`;
          router.push(gameUrl);
        } else if (bracketData.type === 'BRACKET_UPDATE') {
          if(bracketData.matches.semifinals.match1.p1 === null){
            return;
          }
          setTournamentData(bracketData);
        }
      });

      return cleanup;
    };

    setupListener();

    return () => {
      setupListener().then(cleanup => {
        if (cleanup) cleanup();
      });
    };
  }, [tournamentId, router]);

  const handleInviteFriend = (friendshipId, friendUsername) => {
    if (selectedMap) {
      const message = {
        type: 'game_invitation',
        friendship_id: friendshipId,
        map: selectedMap,
        sender_username: userData.username,
        sender_image: userData.image_field,
        receiver_username: friendUsername,
        timestamp: new Date().toISOString()
      };
      send(message);
      toast.success(`Invitation sent to ${friendUsername}!`);
      setShowFriendsPopup(false);
    } else {
      console.warn('❌ No map selected when trying to invite friend');
      toast.error('Please select a map first!');
    }
  };

  const handleJoinTournament = async () => {
    if (!selectedMap) {
      toast.error('Please select a map first!');
      return;
    }

    if (!alias) {
      toast.error('Please enter an alias name');
      return;
    }
    else
    { 
      setShowAliasPopup(false);
    }
    
    setIsJoining(true);
    try {
      const result = await gameService.joinTournament(userData, selectedMap, alias);
      if (result.success) {
        setHasJoinedTournament(true);
        setTournamentId(result.tournamentId);
        toast.success('Successfully joined tournament queue!');
        // show A popup to let the user enter his alias name
      } else {
        if (result.error === 'already in tournament') {
          setHasJoinedTournament(true);
          toast.error('You are already in a tournament');
        } else {
          toast.error(result.error || 'Failed to join tournament');
        }
      }
    } catch (error) {
      console.error('Error joining tournament:', error);
      if (error.error === 'already in tournament') {
        setHasJoinedTournament(true);
        toast.error('You are already in a tournament');
      } else {
        toast.error(error.message || 'Failed to join tournament');
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handlePlay = () => {
    if (isMode === 'Friends' && selectedMap) {
      setShowFriendsPopup(true);
    } else if (isMode === 'Bot' && selectedMap) {
      const username = userData?.username;
      if (!username) {
        toast.error('User data not available');
        return;
      }
      router.push(`/Game/singleAIGame?map=${selectedMap}&username=${username}`);
    }
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
  };

  const handleModeSelect = (mode) => {
    // If the same mode is clicked again, unselect it
    if (isMode === mode) {
      setIsMode(null);
    } else {
      setIsMode(mode);
    }
  };

  const handleCloseTournament = () => {
    setShowTournament(false);
    window.location.href = '/Game';
  };

  const handleAlias = () => {
    setShowAliasPopup(true);
  }


  return (
    <div className="relative w-full h-full">
      <div className={`flex-1 w-full h-full overflow-y-auto flex flex-wrap items-center justify-center p-4`}>
        <motion.div className={`motion-preset-expand rounded-3xl border-solid border-[#BCBCC9] bg-[#F4F4FF] flex flex-col shadow-lg shadow-[#BCBCC9] items-center w-[95%] md:w-[90%] min-h-[90vh] md:min-h-[1300px] bg-[#F4F4FF] justify-center p-4 md:p-8`}>
          <div className="w-full flex flex-col items-center justify-start space-y-6 md:space-y-8">
            <h1 className="text-xl md:text-2xl lg:text-4xl font-extrabold tracking-wide text-[#242F5C] mt-4">
              CHOOSE YOUR MAP
            </h1>
            <hr className="w-[80%] md:w-[50%] h-[3px] bg-[#CDCDE5] border-none rounded-full" />
            
            {/* Map Selection */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-20 w-full pt-4 md:pt-10">
              <div className="w-full md:w-auto px-4 md:px-0 relative">
                <div className="relative group">
                  <Image 
                    src="/images/WhiteMap.svg" 
                    alt="WhiteMap" 
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: '100%', height: 'auto' }}
                    className="max-w-[250px] md:max-w-[400px] lg:max-w-[500px] cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
                    priority
                    onClick={() => setSelectedMap('White Map')}
                  />
                  {selectedMap === 'White Map' && (
                    <div className="absolute top-2 right-2 md:right-4 bg-[#242F5C] text-white p-1.5 md:p-2 rounded-full motion-preset-expand">
                      <Check size={16} className="md:w-5 md:h-5" />
                    </div>
                  )}
                </div>
                <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold tracking-wide text-[#242F5C] text-center p-4">
                  White Map
                </h1>
              </div>
              <div className="w-full md:w-auto px-4 md:px-0 relative">
                <div className="relative group">
                  <Image 
                    src="/images/BlueMap.svg" 
                    alt="BlueMap" 
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: '100%', height: 'auto' }}
                    className="max-w-[250px] md:max-w-[400px] lg:max-w-[500px] cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
                    priority
                    onClick={() => setSelectedMap('Blue Map')}
                  />
                  {selectedMap === 'Blue Map' && (
                    <div className="absolute top-2 right-2 md:right-4 bg-white text-[#242F5C] p-1.5 md:p-2 rounded-full motion-preset-expand">
                      <Check size={16} className="md:w-5 md:h-5" />
                    </div>
                  )}
                </div>
                <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold tracking-wide text-[#242F5C] text-center p-4">
                  Blue Map
                </h1>
              </div>
            </div>

            {/* Game Mode Selection */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full px-4 md:px-0">
              <button 
                onClick={() => handleModeSelect('Friends')} 
                disabled={!selectedMap}
                className={`relative w-full sm:w-auto py-3 md:py-4 px-6 md:px-8 lg:px-12 bg-[#242F5C] rounded-xl md:rounded-full cursor-pointer font-bold md:font-extrabold text-base md:text-lg text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ${selectedMap ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed hover:scale-100'}`}
              >
                <img 
                  src="/images/PlayWithFriends.svg" 
                  alt="Friends icon" 
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                Friends
                {isMode === 'Friends' && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-3 bg-white text-[#242F5C] p-1.5 rounded-full motion-preset-expand">
                    <Check size={12} />
                  </div>
                )}
              </button>

              <button 
                onClick={() => handleModeSelect('Bot')} 
                disabled={!selectedMap}
                className={`relative w-full sm:w-auto py-3 md:py-4 px-6 md:px-8 lg:px-12 bg-[#242F5C] rounded-xl md:rounded-full cursor-pointer font-bold md:font-extrabold text-base md:text-lg text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ${selectedMap ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed hover:scale-100'}`}
              >
                <img 
                  src="/images/PlayWithFriends.svg" 
                  alt="Bot icon" 
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                Bot
                {isMode === 'Bot' && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-3 bg-white text-[#242F5C] p-1.5 rounded-full motion-preset-expand">
                    <Check size={12} />
                  </div>
                )}
              </button>
            </div>

            {/* Play and Tournament buttons */}
            <div className="flex flex-col gap-4 w-full px-4 md:px-0">
              <button 
                onClick={handlePlay}
                disabled={!selectedMap || !isMode}
                className="w-full md:w-[300px] mx-auto py-3 md:py-4 bg-[#242F5C] rounded-xl md:rounded-full cursor-pointer font-bold md:font-extrabold text-base md:text-lg text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                PLAY
              </button>
              <button 
                className="w-full md:w-[300px] mx-auto py-3 md:py-4 bg-[#242F5C] rounded-xl md:rounded-full cursor-pointer font-bold md:font-extrabold text-base md:text-lg text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                onClick={() => handleAlias()}
                disabled={isJoining || hasJoinedTournament || !selectedMap || isMode === 'Friends' || isMode === 'Bot'}
              >
                <img 
                  src="/images/ADD.svg" 
                  alt="ADD icon" 
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                {isJoining ? 'Joining...' : hasJoinedTournament ? 'Already in Tournament' : 'Join Tournament'}
              </button>
            </div>
            {showAliasPopup && (
                //make a popup to let the user enter his alias name
                <div className="fixed inset-0 z-50">
                  <div className="fixed inset-0 backdrop-blur-md bg-[#F4F4FF]/30" />
                  <div className="relative h-full flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-[#F4F4FF] rounded-3xl p-4 md:p-8 w-[95%] md:w-[90%] max-w-[500px] max-h-[90vh] md:max-h-[80vh] shadow-lg border border-[#BCBCC9] m-4 overflow-hidden"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl md:text-2xl font-extrabold text-[#242F5C]">Enter Alias Name</h2>
                      </div>
                      <div className="mb-6">
                        <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                       
                          <input 
                            type="text" 
                            placeholder="Enter your alias name" 
                            className="w-full px-3 py-2 rounded-xl font-semibold text-[#242F5C] bg-transparent border-none focus:outline-none"
                            onChange={(e) => setAlias(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleJoinTournament()}
                          
                          className="px-5 py-2 rounded-xl font-semibold transition-all cursor-pointer ease-in-out duration-300 bg-[#242F5C] text-white hover:bg-[#1a2340] hover:scale-105"
                        >
                          Submit
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}
          </div>
        </motion.div>
      </div>

      {/* Friends Popup */}
      {showFriendsPopup && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 backdrop-blur-md bg-[#F4F4FF]/30" />
          <div className="relative h-full flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#F4F4FF] rounded-3xl p-4 md:p-8 w-[95%] md:w-[90%] max-w-[500px] max-h-[90vh] md:max-h-[80vh] shadow-lg border border-[#BCBCC9] m-4 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <img 
                    src="/images/PlayWithFriends.svg" 
                    alt="Friends icon" 
                    className="w-8 h-8"
                  />
                  <h2 className="text-2xl font-extrabold text-[#242F5C]">Invite Friends</h2>
                </div>
                <button
                  onClick={() => setShowFriendsPopup(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#242F5C] hover:text-white transition-all duration-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                  <div className="w-10 h-10 rounded-[5px] bg-[#242F5C] flex items-center justify-center">
                    <img 
                      src={selectedMap === 'White Map' ? '/images/WhiteMap.svg' : '/images/BlueMap.svg'}
                      alt="Selected Map"
                      width={32}
                      height={32}
                      
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Selected Map</p>
                    <p className="font-semibold text-[#242F5C]">{selectedMap}</p>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {!friends || friends.length === 0 ? (
                  <div className="text-center py-8">
                    <img 
                      src="/images/PlayWithFriends.svg" 
                      alt="No friends"
                      className="w-16 h-16 mx-auto mb-4 opacity-50"
                    />
                    <p className="text-gray-500">No friends available</p>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div
                    key={friend.freindship_id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={friend.user.image_field ? `https://10.13.7.8/api/api${friend.user.image_field}` : "/images/Default_profile.png"}
                            alt={friend.user.username}
                            width={60}
                            height={60}
                            className="rounded-full object-cover w-[60px] h-[60px] border-2 border-gray-200"
                          />
                          <span
                            className={`absolute bottom-1 right-0 w-3 h-3 rounded-full ${
                              friend.user.is_on ? 'bg-green-500' : 'bg-gray-500'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-[#242F5C]">{friend.user.username}</p>
                          <p className="text-sm text-gray-500">
                            {friend.user.is_on ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleInviteFriend(friend.freindship_id, friend.user.username)}
                        disabled={!friend.user.is_on}
                        className="px-5 py-2 rounded-xl font-semibold transition-all cursor-pointer ease-in-out duration-300 bg-[#242F5C] text-white hover:bg-[#1a2340] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        Invite
                      </button>
                    </div>
                  ))
                )}
              </div>

              <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #BCBCC9;
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #242F5C;
                }
              `}</style>
            </motion.div>
          </div>
        </div>
      )}

      {/* Tournament Modal */}
      {showTournament && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 backdrop-blur-md bg-[#F4F4FF]/30" />
          <div className="relative h-full flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#F4F4FF] rounded-3xl p-4 md:p-8 w-[95%] md:w-[90%] max-w-4xl mx-4 shadow-lg border border-[#BCBCC9]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-extrabold text-[#242F5C]">Tournament</h2>
                <button
                  onClick={handleCloseTournament}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#242F5C] hover:text-white transition-all duration-300"
                >
                  <X size={20} />
                </button>
              </div>
              {tournamentData && (
                <TournamentBracket tournamentData={tournamentData} />
              )}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainComponent;