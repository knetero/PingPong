import customAxios from '../customAxios';

let ws = null;
let reconnectInterval = 5000; // Reconnect every 5 seconds

// Cache for tournament data
let lastKnownTournamentData = null;

const initializeBracketWebSocket = () => {
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    ws = new WebSocket(`wss://10.13.7.8/api/wss/tournament/tour/PLAY/`);
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('WebSocket connection timeout'));
    }, 5000);

    const originalOnOpen = ws.onopen;
    ws.onopen = (event) => {
      clearTimeout(timeout);
      if (originalOnOpen) originalOnOpen(event);
      resolve(ws);
    };

    // Add general message handler for all tournament updates
    const originalOnMessage = ws.onmessage;
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTimeout(1000);

      if (originalOnMessage) originalOnMessage(event);
    };

    ws.onerror = (error) => {
      console.error('Bracket WebSocket Error:', error);
      clearTimeout(timeout);
      reject(error);
      reconnectWebSocket();
    };

    ws.onclose = () => {
      reconnectWebSocket();
    };

    // If already open, resolve immediately
    if (ws.readyState === WebSocket.OPEN) {
      clearTimeout(timeout);
      resolve(ws);
    }
  });
};

const reconnectWebSocket = () => {
  setTimeout(() => {
    initializeBracketWebSocket()
      .then(() => {
      })
      .catch((error) => {
        console.error('Failed to reconnect to WebSocket:', error);
        reconnectWebSocket();
      });
  }, reconnectInterval);
};

export const gameService = {
  // Initialize WebSocket connection
  initializeBracketWebSocket,

  // Join tournament via WebSocket
  joinTournament: async (userData, mapType, alias) => {
    try {
      // Ensure WebSocket is connected
      const socket = await gameService.initializeBracketWebSocket();
      
      return new Promise((resolve, reject) => {
        try {
          // Send join tournament message
          socket.send(JSON.stringify({
            type: 'join_tournament',
            data: {
              userId: userData.id,
              username: userData.username,
              mapType,
              alias
            }
          }));

          // Send join tournament message
          socket.send(JSON.stringify({
            type: 'join_tournament',
            data: {
              userId: userData.id,
              username: userData.username,
              mapType,
              alias
            }
          }));

          // Set up one-time message handler for join response
          const handleJoinResponse = (event) => {
            const response = JSON.parse(event.data);
            if (response.type === 'join_tournament_response') {
              socket.removeEventListener('message', handleJoinResponse);
              if (response.success) {
                resolve({
                  success: true,
                  tournamentId: response.tournamentId,
                  message: response.message
                });
              } else {
                reject({
                  success: false,
                  error: response.error
                });
              }
            }
          };
          
          socket.addEventListener('message', handleJoinResponse);
        } catch (error) {
          reject({
            success: false,
            error: error.message
          });
        }
      });
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to connect to tournament server'
      };
    }
  },

  // Setup WebSocket listener for bracket updates
  setupBracketListener: async (tournamentId, onUpdate) => {
    try {
      const socket = await gameService.initializeBracketWebSocket();

      const messageHandler = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'BRACKET_UPDATE' && data.tournamentId === tournamentId) {
          // Update finals players based on semifinal winners
          if (data.matches && data.matches.semifinals && data.matches.final) {
            const semifinals = data.matches.semifinals;
            
            // Set player1 in finals based on match1 winner
            if (semifinals.match1 && semifinals.match1.winner === 'player1') {
              data.matches.final.player1 = semifinals.match1.player1;
            } else if (semifinals.match1 && semifinals.match1.winner === 'player2') {
              data.matches.final.player1 = semifinals.match1.player2;
            }

            // Set player2 in finals based on match2 winner
            if (semifinals.match2 && semifinals.match2.winner === 'player1') {
              data.matches.final.player2 = semifinals.match2.player1;
            } else if (semifinals.match2 && semifinals.match2.winner === 'player2') {
              data.matches.final.player2 = semifinals.match2.player2;
            } else if (semifinals.match2 && semifinals.match2.winner === 'player3') {
              data.matches.final.player2 = semifinals.match2.player1;
            }
          }

          // Preserve winner information from previous state if needed
          if (lastKnownTournamentData && lastKnownTournamentData.matches) {
            if (data.matches.final && lastKnownTournamentData.matches.final) {
              if (!data.matches.final.winner && lastKnownTournamentData.matches.final.winner) {
                data.matches.final.winner = lastKnownTournamentData.matches.final.winner;
              }
            }
            if (data.matches.semifinals && lastKnownTournamentData.matches.semifinals) {
              ['match1', 'match2'].forEach(match => {
                if (data.matches.semifinals[match] && 
                    lastKnownTournamentData.matches.semifinals[match] &&
                    !data.matches.semifinals[match].winner && 
                    lastKnownTournamentData.matches.semifinals[match].winner) {
                  data.matches.semifinals[match].winner = lastKnownTournamentData.matches.semifinals[match].winner;
                }
              });
            }
          }
          
          lastKnownTournamentData = data;
          onUpdate(data);
        } else {
          onUpdate(data);
        }
      };

      socket.addEventListener('message', messageHandler);

      // If we have cached data, immediately send it
      if (lastKnownTournamentData && lastKnownTournamentData.tournamentId === tournamentId) {
        onUpdate(lastKnownTournamentData);
      }

      return () => {
        socket.removeEventListener('message', messageHandler);
      };
    } catch (error) {
      console.error('Error setting up bracket listener:', error);
    }
  },

  // Get WebSocket instance
  getWebSocket: () => {
    return ws;
  },

  // Close WebSocket connection
  disconnect: () => {
    if (ws) {
      ws.close();
      ws = null;
    }
  }
};

export default gameService;
