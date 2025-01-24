'use client';

import { useSearchParams } from 'next/navigation';
import PingPongGame from './PingPongGame';

export default function PingPongGamePage() {
  const searchParams = useSearchParams();
  
  // Check if it's a tournament game
  const isTournament = searchParams.has('turn-room-name');
  
  const roomName = isTournament ? searchParams.get('turn-room-name') : searchParams.get('room_name');
  const player1 = searchParams.get('player1'); // This will be the username in tournament mode
  const player2 = !isTournament ? searchParams.get('player2') : null; // Only used in normal game
  const map = searchParams.get('map');


  // Only render the game component if we have the required props
  if (!roomName || !player1) {
    console.error('Missing required props:', { roomName, player1 });
    return <div>Missing required game parameters</div>;
  }

  return (
    <PingPongGame
      roomName={roomName}
      player1={player1}
      player2={player2}
      map={map}
      isTournament={isTournament}
    />
  );
}
