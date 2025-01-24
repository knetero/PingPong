'use client'

import { useEffect, useRef, useState } from 'react';
import styles from '../ping-pong/PingPongGame.module.css';
import { useRouter } from 'next/navigation';
import customAxios from '../../../customAxios';

const SingleAIGame = ({ playerData }) => {
  const router = useRouter();
  const canvasRef = useRef(null);
  const [player1Name] = useState(playerData?.username || 'Player 1');
  const player1ScoreRef = useRef(0);
  const player2ScoreRef = useRef(0);
  const requestRef = useRef();
  const keyStateRef = useRef({});

  const gameStateRef = useRef({
    player1Pos: { x: 0, y: 0 },
    player2Pos: { x: 0, y: 0 },
    ballPos: { x: 0, y: 0 },
    ballDirection: { x: 1, y: 1 },
    roundWinner: 0,
    botBallPos: { x: 0, y: 0 },
    botBallDirection: { x: 0, y: 0 },
    runAgain: true,
    randomBoolean: Math.random() < 0.4
  });

  // Game constants
  const CANVAS_DIM = { width: 1200, height: 800 };
  const PLAYERS_DIM = { width: 10, height: 100 };
  const BALL_RADIUS = 10;
  const PLAYER_SPEED = 10;
  const BALL_SPEED = { x: 5, y: 5 };



  const render = (ctx) => {
    const state = gameStateRef.current;
    

    
    // Clear and set background based on map preference
    ctx.clearRect(0, 0, CANVAS_DIM.width, CANVAS_DIM.height);
    
    // Check player data for map preference
    if (playerData?.map === 'Blue Map') {
        ctx.fillStyle = "#242F5C";  // Blue background
        ctx.fillRect(0, 0, CANVAS_DIM.width, CANVAS_DIM.height);
        ctx.fillStyle = "white";  // Set elements to white for blue background
    } else {
        ctx.fillStyle = "#E1E1FF";  // Light purple background for White Map
        ctx.fillRect(0, 0, CANVAS_DIM.width, CANVAS_DIM.height);
        ctx.fillStyle = "black";  // Keep elements black for white background
    }
    
    // Draw center line
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_DIM.width / 2, 0);
    ctx.lineTo(CANVAS_DIM.width / 2, CANVAS_DIM.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Set up text properties
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Draw player names
    ctx.font = "20px Arial";
    ctx.fillText(player1Name, CANVAS_DIM.width / 4, 30);
    ctx.fillText("AI Bot", (CANVAS_DIM.width / 4) * 3, 30);
    ctx.stroke()
    
    // Draw scores
    ctx.font = "bold 40px Arial";
    ctx.fillText(player1ScoreRef.current.toString(), CANVAS_DIM.width / 4, 70);
    ctx.fillText(player2ScoreRef.current.toString(), (CANVAS_DIM.width / 4) * 3, 70);
    ctx.stroke();    
    // Draw paddles
    ctx.fillRect(
      state.player1Pos.x,
      state.player1Pos.y,
      PLAYERS_DIM.width,
      PLAYERS_DIM.height
    );
    ctx.fillRect(
      state.player2Pos.x,
      state.player2Pos.y,
      PLAYERS_DIM.width,
      PLAYERS_DIM.height
    );

    // Draw ball
    ctx.beginPath();
    ctx.arc(
      state.ballPos.x,
      state.ballPos.y,
      BALL_RADIUS,
      0,
      Math.PI * 2,
      false
    );
    ctx.fill();
  };

  const collision = () => {
    const state = gameStateRef.current;
    
    // Ball collision with players
    if (state.ballPos.x - BALL_RADIUS <= state.player1Pos.x + PLAYERS_DIM.width &&
        state.ballPos.y >= state.player1Pos.y &&
        state.ballPos.y <= state.player1Pos.y + PLAYERS_DIM.height) {
      state.ballDirection.x = 1;
    }
    if (state.ballPos.x + BALL_RADIUS >= state.player2Pos.x &&
        state.ballPos.y >= state.player2Pos.y &&
        state.ballPos.y <= state.player2Pos.y + PLAYERS_DIM.height) {
      state.ballDirection.x = -1;
    }
    
    // Ball collision with top/bottom walls
    if (state.ballPos.y - BALL_RADIUS <= 0 || state.ballPos.y + BALL_RADIUS >= CANVAS_DIM.height) {
      state.ballDirection.y *= -1;
    }
    
    // Player collision with walls
    if (state.player1Pos.y < 0) state.player1Pos.y = 0;
    if (state.player1Pos.y + PLAYERS_DIM.height > CANVAS_DIM.height) {
      state.player1Pos.y = CANVAS_DIM.height - PLAYERS_DIM.height;
    }
    if (state.player2Pos.y < 0) state.player2Pos.y = 0;
    if (state.player2Pos.y + PLAYERS_DIM.height > CANVAS_DIM.height) {
      state.player2Pos.y = CANVAS_DIM.height - PLAYERS_DIM.height;
    }
  };

  const goal = () => {
    const state = gameStateRef.current;
    
    if (state.ballPos.x - BALL_RADIUS <= 0) {
      return 2;
    }
    if (state.ballPos.x + BALL_RADIUS >= CANVAS_DIM.width) {
      return 1;
    }
    return 0;
  };

  const AIBot133721 = () => {
    const state = gameStateRef.current;
    
    if(state.runAgain === true)
    {
        state.botBallDirection = state.ballDirection;
        state.botBallPos = state.ballPos;
        state.runAgain = false;
    }
    if(state.botBallDirection.x === 1){
        if((state.player2Pos.y + PLAYERS_DIM.height / 2) < (CANVAS_DIM.height / 2 - 15) && (state.botBallPos.x < CANVAS_DIM.width / 2))
        {
            state.player2Pos.y += 10;
            return;
        }
        if((state.player2Pos.y + PLAYERS_DIM.height / 2) > (CANVAS_DIM.height / 2 + 15) && (state.botBallPos.x < CANVAS_DIM.width / 2)){
            state.player2Pos.y -= 10;
            return;
        }
        if(state.botBallPos.x > CANVAS_DIM.width / 2){
            if(state.randomBoolean)
            {
                if(state.botBallPos.y < (state.player2Pos.y - 10)){
                    state.player2Pos.y -= 10;
                }
                if(state.botBallPos.y > (state.player2Pos.y + PLAYERS_DIM.height + 10)){
                    state.player2Pos.y += 10;
                }    
                return;
            }
            if(state.botBallPos.y < (state.player2Pos.y + PLAYERS_DIM.height / 2)){
                state.player2Pos.y -= 10;
            }
            if(state.botBallPos.y > (state.player2Pos.y + PLAYERS_DIM.height / 2)){
                state.player2Pos.y += 10;
            }
        }
    }
  };

  const gameLoop = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const state = gameStateRef.current;

    AIBot133721();

    collision();
    if (keyStateRef.current["w"]) {
      state.player1Pos.y -= PLAYER_SPEED;
    }
    if (keyStateRef.current["s"]) {
      state.player1Pos.y += PLAYER_SPEED;
    }

    state.ballPos.x += BALL_SPEED.x * state.ballDirection.x;
    state.ballPos.y += BALL_SPEED.y * state.ballDirection.y;

    const goalResult = goal();
    if (goalResult === 1) {
      state.roundWinner = 1;
      player1ScoreRef.current += 1;
      if (player1ScoreRef.current === 5) {
        cancelAnimationFrame(requestRef.current);
        sendMatchData(player1ScoreRef.current, player2ScoreRef.current, "Player1");
        setTimeout(() => {
          router.push('/Dashboard');
        }, 1700);
        return;
      }
      initGame();
      state.ballPos = { x: CANVAS_DIM.width / 2 - 5, y: CANVAS_DIM.height / 2 - 5 };
      state.ballDirection = { x: -1, y: Math.random() > 0.5 ? 1 : -1 };
    }
    if (goalResult === 2) {
      state.roundWinner = 2;
      player2ScoreRef.current += 1;
      if (player2ScoreRef.current === 5) {
        cancelAnimationFrame(requestRef.current);
        sendMatchData(player1ScoreRef.current, player2ScoreRef.current, "Player2");
        setTimeout(() => {
          router.push('/Dashboard');
        }, 1700);
        return;
      }
      initGame();
      state.ballPos = { x: CANVAS_DIM.width / 2 - 5, y: CANVAS_DIM.height / 2 - 5 };
      state.ballDirection = { x: 1, y: Math.random() > 0.5 ? 1 : -1 };
    }

    render(ctx);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const initGame = () => {
    const state = gameStateRef.current;
    
    if (canvasRef.current) {
      canvasRef.current.width = CANVAS_DIM.width;
      canvasRef.current.height = CANVAS_DIM.height;
    }

    state.ballDirection = state.roundWinner === 2 ? { x: 1, y: 1 } : { x: -1, y: -1 };
    state.randomBoolean = Math.random() < 0.5;
    state.player1Pos = { x: 0, y: CANVAS_DIM.height / 2 - PLAYERS_DIM.height / 2 };
    state.player2Pos = { x: CANVAS_DIM.width - PLAYERS_DIM.width, y: CANVAS_DIM.height / 2 - PLAYERS_DIM.height / 2 };
    state.ballPos = { x: CANVAS_DIM.width / 2 - 5, y: CANVAS_DIM.height / 2 - 5 };

    if (player1ScoreRef.current >= 5 || player2ScoreRef.current >= 5) {
      cancelAnimationFrame(requestRef.current);
      setTimeout(() => {
        router.push('/Dashboard');
      }, 1500);
      return;
    }
  };

  const sendMatchData = (player1_score, player2_score, winner) => {
    // Determine the actual winner based on username
    let actualWinner;
    if (winner === "Player1") {
        actualWinner = playerData?.username;
    } else {
        actualWinner = "AI Bot";
    }

    const data = {
        player1: playerData?.username,
        player2: "AI Bot",
        player1_score: player1_score,
        player2_score: player2_score,
        winner: actualWinner
    };
    
    customAxios.post('https://10.13.7.8/api/game/matches/', data)
        .then(response => {
            // console.log('Success:', response.data);
        })
        .catch(error => {
            // console.error('Error:', error);
        });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      gameStateRef.current.runAgain = true;
    }, 1000);
    return () => clearInterval(interval);
  });

  useEffect(() => {
    if (canvasRef.current) {
      initGame();
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      render(ctx);
    }
  }, [player1ScoreRef.current, player2ScoreRef.current]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      keyStateRef.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      keyStateRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className={styles.gameContainer}>
      <canvas ref={canvasRef} className={styles.canvas}></canvas>
      {/* <div className={styles.scoreDisplay}>
        <div className={styles.scoreContainer}>
          <span className={styles.score}>{player1ScoreRef.current}</span>
          <span className={styles.scoreSeparator}>:</span>
          <span className={styles.score}>{player2ScoreRef.current}</span>
        </div>
      </div> */}
      <div className={styles.gameMessage}>press "w" or "s" to play</div>
    </div>
  );
};

export default SingleAIGame;
