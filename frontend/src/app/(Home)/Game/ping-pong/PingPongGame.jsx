import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './PingPongGame.module.css';
import { Montserrat } from 'next/font/google';
import customAxios from '../../../customAxios';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

const PingPongGame = ({ roomName, player1, player2, player3, player4, map, isTournament }) => {
    const router = useRouter();
    const [socket, setSocket] = useState(null);
    const playerRoleRef = useRef(null);  // Will store 'player1', 'player2', etc.
    const player2StateRef = useRef('');  // Will store 'player1', 'player2', etc.
    const [gameStarted, setGameStarted] = useState(true);
    const [match, setMatch] = useState('');
    const [myUsername, setMyUsername] = useState(player1 || '');  // Initialize with player1
    const [direction, setDirection] = useState(null);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [gameData, setGameData] = useState({ players: { player1: { score: 0 }, player2: { score: 0 } } });
    const canvasRef = useRef(null);
    const wsRef = useRef(null);
    const cleanupRef = useRef(false);
    const searchParams = useSearchParams();
    const chat_bot_message_already_sent = useRef(false);
    const finalStartedRef = useRef(false);

    // Effect to update username if player1 prop changes
    useEffect(() => {
        if (player1 && myUsername !== player1) {
            setMyUsername(player1);
        }
    }, [player1, myUsername]);

    const handleGameEnd = () => {
        if (isRedirecting) return;
        setIsRedirecting(true);
        
        // Use requestAnimationFrame to ensure we're not updating state too quickly
        requestAnimationFrame(() => {
            if (!cleanupRef.current) {
                // Use replace instead of push to avoid history stack issues
                router.replace(`/Game?showTournament=true&tournamentRoom=${roomName}`);
                cleanupRef.current = true;
            }
        });
    };
    const handleGameEnd_normal = () => {
        if (isRedirecting) return;
        setIsRedirecting(true);
        requestAnimationFrame(() => {
            if (!cleanupRef.current) {
                router.push(`/Game`);
            }
        }
        );
    };
    // Separate effect for WebSocket connection
    useEffect(() => {
        if (!roomName || !myUsername || isRedirecting || cleanupRef.current) {
            return;
        }

        const connectWebSocket = () => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                return;
            }

            const url = isTournament ? 
                `wss://10.13.7.8/api/wss/tournament/${roomName}/${roomName}/` : 
                `wss://10.13.7.8/api/wss/tournament/${roomName}/`;


            const ws = new WebSocket(url);
            wsRef.current = ws;
            setSocket(ws);

            ws.onopen = () => {
                if (isRedirecting) {
                    ws.close();
                    return;
                }

                ws.send(JSON.stringify({
                    'player': playerRoleRef.current,
                    'direction': direction,
                    'username': myUsername,
                    'gameStarted': gameStarted
                }));
            };

            ws.onmessage = (e) => {
                if (isRedirecting) return;
                
                const data = JSON.parse(e.data);
                if(data.type === 'BRACKET_UPDATE') {
                    // console.log(data);
                    return;
                }
                if(data.type === 'gamestart') {
                    return;
                }
                
                
                if (data.is_tournament) {
                    handleTournamentData(data);
                } else {
                    handleNormalGameData(data);
                }
                
                updateGame(data);
            };

            ws.onclose = (e) => {
                wsRef.current = null;
                setSocket(null);
                
                // Only attempt to reconnect if not cleaning up
                if (!isRedirecting && !cleanupRef.current && myUsername && gameStarted) {
                    setTimeout(connectWebSocket, 1000);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                if (!isRedirecting) {
                    handleGameEnd();
                }
            };
        };

        // Initial connection
        connectWebSocket();

    }, [roomName, myUsername, isTournament, isRedirecting]);

    async function send_chat_bot (data)  {
        if(chat_bot_message_already_sent.current === true) {
            return;
        }
        chat_bot_message_already_sent.current = true;
        const response = await customAxios.post('https://10.13.7.8/api/friend/sendchat/', {
            
                send: 'bot',
                receive: data.players[playerRoleRef.current].username,
                message: "you will play against " + data.players[player2StateRef.current].username,
                timestamp: '',
                chat_id: 'id: ' + Math.random()
        })
    
    };

    const handleTournamentData = (data) => {
        let currentMatch = '';
        let foundMatch = false;
        for (const [role, player] of Object.entries(data.players)) {
            
            if (player.username === myUsername) {
                foundMatch = true;
                playerRoleRef.current = role;
                currentMatch = player.current_match;

                if (currentMatch === 'match1') {
                    player2StateRef.current = role === 'player1' ? 'player2' : 'player1';
                    send_chat_bot(data);
                    if(data.matches[currentMatch].winner) {

                        if (data.matches[currentMatch].winner === playerRoleRef.current) {
                            // chat_bot_message_already_sent.current = false;
                        } else if (data.matches[currentMatch].game_start === false) {

                            handleGameEnd();


                            return;
                        }
                    }
                } else if (currentMatch === 'match2') {
                    player2StateRef.current = role === 'player3' ? 'player4' : 'player3';
                    send_chat_bot(data);
                    if(data.matches[currentMatch].winner) {

                        if (data.matches[currentMatch].winner === playerRoleRef.current) {
                            // chat_bot_message_already_sent.current = false;
                        } else  if (data.matches[currentMatch].game_start === false) {
                            handleGameEnd();
                            return;
                        }
                    }
                } else if (currentMatch === 'final') {
                    const match = (data.matches[currentMatch]) 
                    if(match['p1_username'] === myUsername) {
                        player2StateRef.current = match['player2'];
                    } else if(match['p2_username'] === myUsername) {
                        player2StateRef.current = match['player1'];
                    }
                    if(finalStartedRef.current === false) {
                        chat_bot_message_already_sent.current = false;
                    }
                    finalStartedRef.current = true;
                    send_chat_bot(data);
                    if(data.matches[currentMatch].winner) {
                        handleGameEnd();
                    }

                } else {
                }
                break;
            }
        }
        
        if (!foundMatch) {
        }

        setMatch(currentMatch);
    };

    const handleNormalGameData = (data) => {
        if (data.start_game === false) {
            handleGameEnd_normal();
        }
        
    };

    const updateWaitingScreen = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '28px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for other player to be ready...', canvas.width / 2, canvas.height / 3);
        ctx.fill();
    };

    const updateGame = (data) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setGameData(data);  // Update game data state

        const ctx = canvas.getContext('2d');
        canvas.width = data.width;
        canvas.height = data.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!gameStarted) {
            ctx.font = '30px Arial';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillText('Press Space to Start', canvas.width / 2 - 150, canvas.height / 2 + 50);
            return;
        }

        if (data.is_tournament) {
            // console.log(data);
            drawTournamentGame(ctx, canvas, data);
            if(!playerRoleRef.current) {
                return;
            }
            const currentMatch = data.players[playerRoleRef.current].current_match;

            if(data.matches[currentMatch].game_start === false) {
                updateWaitingScreen();
            }
        } else if(data.players && !data.players.player4){
            drawNormalGame(ctx, canvas, data);
        }
    };

    const drawNormalGame = (ctx, canvas, data) => {
        // Draw background based on map choice
        if (map === 'Blue Map') {
            ctx.fillStyle = '#242F5C';  // Dark blue background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'white';  // White center line
            ctx.fillStyle = 'white';    // White elements
        } else {
            ctx.fillStyle = '#E1E1FF';  // Light purple background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#242F5C';  // Dark blue center line
            ctx.fillStyle = '#242F5C';    // Dark blue elements
        }
        
        // Draw center line
        ctx.setLineDash([10, 10]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw paddles (using current fillStyle)
        // Player 1 paddle
        ctx.fillRect(data.players.player1.x, data.players.player1.y, 
                    data.players.player1.width, data.players.player1.height);
        // Player 2 paddle
        ctx.fillRect(data.players.player2.x, data.players.player2.y,
                    data.players.player2.width, data.players.player2.height);

        // Draw ball with shadow
        ctx.shadowColor = map === 'Blue Map' ? 
            'rgba(255, 255, 255, 0.3)' : 
            'rgba(36, 47, 92, 0.3)';

        ctx.beginPath();
        ctx.arc(data.ball.x, data.ball.y, data.ball.radius, 0, Math.PI * 2);
        
        // draw usernames
        if(data.players.player1.x < (canvas.width / 2)) {
            ctx.font = '30px Arial';
            ctx.fillText(data.players.player1.username, data.players.player1.x + 300, 50);
            ctx.fillText(data.players.player2.username, data.players.player2.x - 300, 50);
            // draw scores
            ctx.font = '80px Arial';
            ctx.fillText(data.players.player1.score, canvas.width / 2 - 100, 100);
            ctx.fillText(data.players.player2.score, canvas.width / 2 + 50, 100);
        }else {
            ctx.font = '30px Arial';
            ctx.fillText(data.players.player1.username, data.players.player1.x - 300, 50);
            ctx.fillText(data.players.player2.username, data.players.player2.x + 300, 50);
            // draw scores
            ctx.font = '80px Arial';
            ctx.fillText(data.players.player1.score, canvas.width / 2 + 100, 100);
            ctx.fillText(data.players.player2.score, canvas.width / 2 - 50, 100);
        }
        
        ctx.fill();

    };

    const drawTournamentGame = (ctx, canvas, data) => {
        // Draw background based on map choice
        if (map === 'Blue Map') {
            ctx.fillStyle = '#242F5C';  // Dark blue background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'white';  // White center line
            ctx.fillStyle = 'white';    // White elements for paddles, ball, and text
        } else {
            ctx.fillStyle = '#E1E1FF';  // Light purple background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#242F5C';  // Dark blue center line
            ctx.fillStyle = '#242F5C';    // Dark blue elements
        }

        // Draw center line
        ctx.setLineDash([10, 10]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        if (playerRoleRef.current) {
            // Draw player paddle
            const player = data.players[playerRoleRef.current];
            ctx.fillRect(player.x, player.y, player.width, player.height);

            // Draw player score
            ctx.font = '100px Arial';
            ctx.fillStyle = map === 'Blue Map' ? 'white' : 'rgba(0, 0, 0, 0.5)';
            ctx.fillText(
                player.score,
                (player.x < (canvas.width / 2)) ? player.x + 50 : player.x - 125,
                canvas.height / 2 + 50
            );
            
            // Display username
            ctx.font = '30px Arial';
            ctx.fillText(
                player.alias,
                (player.x < (canvas.width / 2)) ? player.x + 50 : player.x - 125,
                50
            );
        }

        if (player2StateRef.current) {
            // Draw opponent paddle
            const opponent = data.players[player2StateRef.current];
            ctx.fillRect(opponent.x, opponent.y, opponent.width, opponent.height);

            // Draw opponent score and username
            ctx.font = '100px Arial';
            ctx.fillStyle = map === 'Blue Map' ? 'white' : 'rgba(0, 0, 0, 0.5)';
            ctx.fillText(
                opponent.score,
                (opponent.x < (canvas.width / 2)) ? opponent.x + 50 : opponent.x - 125,
                canvas.height / 2 + 50
            );

            // Display username
            ctx.font = '30px Arial';
            ctx.fillText(
                opponent.alias,
                (opponent.x < (canvas.width / 2)) ? opponent.x + 50 : opponent.x - 125,
                50
            );
        }
        if(!playerRoleRef.current) {
            return;
        }
        const currentMatch = data.players[playerRoleRef.current].current_match;

        let ball = null;

        if (currentMatch === 'match1') {
            ball = data.matches['ball1'];
        } else if (currentMatch === 'match2') {
            ball = data.matches['ball2'];
        } else if (currentMatch === 'final') {
            ball = data.matches['ball_final'];
        }

        if (ball) {
            // set fill color to blue on white map
            ctx.shadowColor = map === 'Blue Map' ? 
                'rgba(255, 255, 255, 0.3)' : 
                'rgba(0, 0, 255, 0.5)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    };

    const init = () => {
        setGameStarted(true);
        playerRoleRef.current = '';
        player2StateRef.current = '';
        setMatch('');
        setDirection(null);
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            let newDirection = null;
            if (!socket || socket.readyState !== WebSocket.OPEN) return;

            switch(event.key) {
                case 'ArrowUp':
                    newDirection = 'up';
                    break;
                case 'ArrowDown':
                    newDirection = 'down';
                    break;
            }

            
            if (newDirection !== direction) {
                setDirection(newDirection);
                socket.send(JSON.stringify({
                    'player': playerRoleRef.current,
                    'direction': newDirection,
                    'username': myUsername,
                    'gameStarted': gameStarted
                }));
            }
        };

        const handleKeyUp = (event) => {
            if (!socket || socket.readyState !== WebSocket.OPEN) return;

            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                setDirection(null);
                socket.send(JSON.stringify({
                    'player': playerRoleRef.current,
                    'direction': null,
                    'username': myUsername,
                    'gameStarted': gameStarted
                }));
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [socket, direction, myUsername, gameStarted]);

    return (
        <div className={`${styles.gameContainer} ${montserrat.className}`}>
            <canvas ref={canvasRef} className={styles.canvas} />
            <div className={styles.gameMessage}>press "Up" or "Down" buttons to play</div>
        </div>
    );
};

export default PingPongGame;