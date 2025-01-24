'use client';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useUser } from './UserContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const GameInviteWebSocketContext = createContext();

export function useGameInviteWebSocket() {
  return useContext(GameInviteWebSocketContext);
}

export function GameInviteWebSocketProvider({ children }) {
  const { userData } = useUser();
  const router = useRouter();
  const wsRef = useRef(null);

  useEffect(() => {
    if (!userData) return;

    const connectWebSocket = () => {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = new WebSocket('wss://10.13.7.8/api/wss/game/invite/');
      
      ws.onopen = () => {
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'game_invitation_received') {
          const customEvent = new CustomEvent(data.type, { detail: data });
          window.dispatchEvent(customEvent);
        } 
        else if (data.type === 'invitation_accepted') {
          
          // Generate a unique room name using friendship_id
          const roomName = `game_${data.friendship_id}`;
          
          // Properly encode URL parameters
          const params = new URLSearchParams({
            room_name: roomName,
            // player1: data.player1, // sender is always player1
            player1: userData.username, // sender is always player1
            map: data.map
          });
          
          // Create game URL with encoded parameters - use same format as GameInvitationHandler
          const gameUrl = `/Game/ping-pong?${params.toString()}`;
          
          // Use replace instead of push to avoid history stacking
          router.replace(gameUrl);
        }
      };

      ws.onclose = (e) => {
        if (userData) {
          setTimeout(connectWebSocket, 3000);
        }
      };

      ws.onerror = (error) => {
        // console.error('🎮 Game invitation WebSocket error:', error);
        // toast.error('Connection error. Trying to reconnect...');
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [userData]);

  const send = (message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      // toast.error('WebSocket connection not ready. Please try again.');
    }
  };

  return (
    <GameInviteWebSocketContext.Provider value={{ send }}>
      {children}
    </GameInviteWebSocketContext.Provider>
  );
}
