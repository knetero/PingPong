# Tournament System Documentation

## Overview
This document explains the tournament system's flow, from initialization to completion, including all components and their interactions.

## Components

### 1. ChooseGame Component
Main component handling tournament setup and player selection.

#### State Management:
```javascript
// Tournament creator info from localStorage
const tournamentCreator = JSON.parse(localStorage.getItem('user')) || {
  id: 1,
  username: "Tournament Creator"
};

// Other important states
const [invitedPlayers, setInvitedPlayers] = useState([]);
const [tournamentId, setTournamentId] = useState(null);
const [tournamentData, setTournamentData] = useState(null);
```

#### Key Functions:
```javascript
handleStartTournament()
- Purpose: Initiates a new tournament
- Flow:
  1. Gets creator info from localStorage
  2. Combines creator with invited players
  3. Sends to backend via gameService
  4. Shows tournament bracket on success
- Parameters: None
- Returns: None
```

### 2. Game Service
Handles all API communications for tournament management.

#### Endpoints:
```javascript
startTournament(players, mapType)
- Purpose: Starts new tournament
- Endpoint: POST /tournament/start
- Parameters:
  {
    players: Array<{id: string, username: string}>,
    mapType: string
  }
- Returns: { success: boolean, tournamentId: string }
```

```javascript
getTournamentData(tournamentId)
- Purpose: Gets current tournament state
- Endpoint: GET /tournament/{tournamentId}
- Returns: Tournament state including matches and results
```

### 3. Tournament Bracket Component
Visual representation of the tournament.

#### Auto-Updates:
```javascript
useEffect(() => {
  if (!tournamentId) return;
  
  // Poll for updates every 3 seconds
  const interval = setInterval(async () => {
    const result = await gameService.getTournamentData(tournamentId);
    if (result.success) {
      setTournamentData(result.data);
    }
  }, 3000);
  
  return () => clearInterval(interval);
}, [tournamentId]);
```

## Frontend Bracket Display

### 1. Bracket Structure
The tournament bracket is displayed in a tree-like structure:
```
Semi-Finals                Finals
[Player1]─┐
         ├─[Winner1]─┐
[Player2]─┘         ├─[Champion]
                    │
[Player3]─┐         │
         ├─[Winner2]─┘
[Player4]─┘
```

### 2. Visual States
Each match box shows:
- Player names
- Match status
- Winner (if determined)

Status Colors:
- Gray: Waiting to start
- Blue: Match in progress
- Green: Match completed
- Gold: Winner highlight

### 3. Data Updates
- Bracket polls backend every 3 seconds
- Updates are automatic, no manual refresh needed
- Changes trigger smooth animations
- Winners progress visually through the bracket

### 4. Component Structure
```jsx
<TournamentBracket>
  <Round1>
    <Match position="top">
      <Player1 />
      <Player2 />
    </Match>
    <Match position="bottom">
      <Player3 />
      <Player4 />
    </Match>
  </Round1>
  <Round2>
    <FinalMatch>
      <Winner1 />
      <Winner2 />
    </FinalMatch>
  </Round2>
</TournamentBracket>
```

## Tournament Bracket Logic

### 1. Bracket Structure
```javascript
// Tournament data structure
{
  rounds: [
    {
      round: 1,
      matches: [
        {
          id: "match1",
          players: [player1, player2],
          winner: null,
          status: "pending" // pending, in_progress, completed
        },
        {
          id: "match2",
          players: [player3, player4],
          winner: null,
          status: "pending"
        }
      ]
    },
    {
      round: 2,
      matches: [
        {
          id: "final",
          players: [], // Will be filled with winners from round 1
          winner: null,
          status: "pending"
        }
      ]
    }
  ],
  currentRound: 1,
  isComplete: false
}
```

### 2. Match Flow
1. **Initial Setup**:
   - First round matches are created automatically
   - Players are paired: [1 vs 2] and [3 vs 4]
   - Match status starts as "pending"

2. **During Tournament**:
   - Active match status changes to "in_progress"
   - When game ends, winner is recorded
   - Match status changes to "completed"
   - Winners advance to next round

3. **Round Progression**:
   - When all matches in a round complete
   - Winners are paired for next round
   - Tournament updates currentRound


## Complete Flow
1. Tournament Creation:
   - Creator info loaded from localStorage
   - Up to 3 players can be invited
   - Map type selected
   - Tournament started via backend

## Tournament Data Structure

### GET /tournament/{tournamentId}

This endpoint returns the current state of a tournament. Here's the expected response structure:

```javascript
{
  "success": true,  // Indicates if the request was successful
  "data": {
    "matches": {
      // Semi-final matches (First Round)
      "semifinals": {
        "match1": {  // First semi-final match
          "player1": {
            "id": "string",        // Unique identifier for the player
            "username": "string",  // Display name of the player
            "profiles_photo": "string"  // URL to player's profile photo
          },
          "player2": {  // Second player in the match
            "id": "string",
            "username": "string",
            "profiles_photo": "string"
          },
          "winner": {  // Winner of this semi-final match
            "id": "string",        // Must match either player1 or player2's id
            "username": "string",  // Winner's username
            "profiles_photo": "string"  // Winner's profile photo
          } // Set to null if match not completed
        },
        "match2": {  // Second semi-final match
          // Same structure as match1
          // Contains the other two players
        }
      },
      // Championship match (Final Round)
      "final": {
        "player1": {  // Winner from first semi-final
          "id": "string",        // Should match winner's id from match1
          "username": "string",  // Winner's username from match1
          "profiles_photo": "string"  // Winner's profile photo from match1
        },
        "player2": {  // Winner from second semi-final
          "id": "string",        // Should match winner's id from match2
          "username": "string",  // Winner's username from match2
          "profiles_photo": "string"  // Winner's profile photo from match2
        },
        "winner": {  // Tournament champion
          "id": "string",        // Must match either final player1 or player2's id
          "username": "string",  // Champion's username
          "profiles_photo": "string"  // Champion's profile photo
        } // null until final match is complete
      },
      "isComplete": boolean  // true when final match has a winner, false otherwise
    }
  }
}
```

#### Detailed Field Explanations

1. **Root Level Fields**
   - `success`: Boolean indicating if the API request was successful
   - `data`: Contains all tournament data

2. **Matches Object**
   - `semifinals`: Contains both semi-final matches
   - `final`: Contains the championship match
   - `isComplete`: Tournament completion status

3. **Semi-finals Structure**
   - `match1`: First semi-final match
   - `match2`: Second semi-final match
   Each match contains:
   - `player1`: First player in the match
   - `player2`: Second player in the match
   - `winner`: Winner of the match (null if not decided)

4. **Final Match Structure**
   - `player1`: Winner from first semi-final (match1)
   - `player2`: Winner from second semi-final (match2)
   - `winner`: Tournament champion

5. **Player Object Structure**
   Each player object must contain:
   - `id`: Unique identifier (string)
   - `username`: Player's display name (string)
   - `profiles_photo`: URL to profile picture (string)

#### Data Flow Examples

1. **Initial State**
   ```javascript
   {
     "semifinals": {
       "match1": {
         "player1": { /* player data */ },
         "player2": { /* player data */ },
         "winner": null
       },
       "match2": {
         "player1": { /* player data */ },
         "player2": { /* player data */ },
         "winner": null
       }
     },
     "final": {
       "player1": null,
       "player2": null,
       "winner": null
     },
     "isComplete": false
   }
   ```

2. **After First Semi-final**
   ```javascript
   {
     "semifinals": {
       "match1": {
         "player1": { /* player data */ },
         "player2": { /* player data */ },
         "winner": { /* winning player data */ }  // Set after match1 completes
       },
       "match2": {
         "player1": { /* player data */ },
         "player2": { /* player data */ },
         "winner": null
       }
     },
     "final": {
       "player1": { /* match1 winner data */ },  // Populated from match1 winner
       "player2": null,
       "winner": null
     },
     "isComplete": false
   }
   ```

3. **Tournament Complete**
   ```javascript
   {
     "semifinals": {
       "match1": { /* completed match data */ },
       "match2": { /* completed match data */ }
     },
     "final": {
       "player1": { /* match1 winner */ },
       "player2": { /* match2 winner */ },
       "winner": { /* tournament champion */ }
     },
     "isComplete": true
   }
   ```

#### Notes for Backend Implementation

1. Player Objects should always include:
   - `id`: Unique identifier
   - `username`: Display name
   - `profiles_photo`: URL to profile picture

2. Match Progress:
   - Semifinal matches should be populated immediately
   - Final match players should be updated as semifinals complete
   - Winner should be null until match is decided

3. Data Consistency:
   - All player objects should follow the same structure
   - Missing photos should default to "/images/avatarInvite.svg"
   - IDs should be consistent across matches

2. Tournament Progress:
   - Automatic updates every 3 seconds
   - Players participate in matches
   - Winners advance automatically
   - Final winner displayed

3. Tournament Completion:
   - Winner highlighted
   - Tournament modal can be closed
   - Ready for new tournament

## WebSocket Communication

### Expected Data Structure for WebSocket Messages
Each message sent from the backend will include a `type` field to indicate the kind of update being sent, along with relevant data:

#### 1. Bracket Update
When there’s an update to the tournament bracket, the backend will send:
```json
{
    "type": "BRACKET_UPDATE",
    "tournamentId": "123",
    "matches": {
        "semifinals": {
            "match1": {  // First semi-final match
                "player1": "Player1",
                "player2": "Player2",
                "winner": "Player1"
            },
            "match2": {
                "player1": "Player3",
                "player2": "Player4",
                "winner": null
            }
        },
        "final": {
            "player1": "Player1",
            "player2": "Player3",
            "winner": null
        }
    }


    
}
```

#### 2. Match Start
When a match starts, the backend will send:
```json
{
    "type": "MATCH_START",
    "tournamentId": "123",
    "match": {
        "matchId": "semifinals.match1",
        "player1": "Player1",
        "player2": "Player2"
    }
}
```

#### 3. Match End
When a match ends, the backend will send:
```json
{
    "type": "MATCH_END",
    "tournamentId": "123",
    "match": {
        "matchId": "semifinals.match1",
        "winner": "Player1"
    }
}
```

#### 4. Tournament End
When the tournament ends, the backend will send:
```json
{
    "type": "TOURNAMENT_END",
    "tournamentId": "123",
    "winner": "Player1"
}
```

#### 5. Error Message
If there’s an error, the backend will send:
```json
{
    "type": "ERROR",
    "message": "Player disconnected"
}
```

### Frontend Handling
On the frontend, the WebSocket listener will parse the incoming messages and update the UI accordingly. The data received will be used to update the tournament state in the application, ensuring real-time updates for users.

## Usage Example for Game Developer

```javascript
// 1. Start Tournament
const startGame = async () => {
  const tournamentData = {
    players: selectedPlayers,
    mapType: 'map1',
  };
  await gameService.startTournament(tournamentData);
};

// 2. Get Tournament Data
const getTournamentData = async () => {
  const result = await gameService.getTournamentData(tournamentId);
  if (result.success) {
    setTournamentData(result.data);
  }
};
```

## Game Service Implementation

```javascript
export const gameService = {
    // Join tournament matchmaking queue (HTTP)
    joinTournament: async (userData, mapType) => {
        try {
            const response = await customAxios.post('/tournament/join', {
                userId: userData.id,
                username: userData.username,
                mapType
            });
            return {
                success: true,
                tournamentId: response.data.tournamentId,
                message: response.data.message
            };
        } catch (error) {
            console.error('Error joining tournament:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}
```

## State Management

### Tournament States:
1. **Not Started**
   - No active tournament
   - Can select players

2. **In Progress**
   - Tournament bracket visible
   - Matches can be updated
   - Shows current progress

3. **Complete**
   - All matches finished
   - Winner displayed
   - Can start new tournament

### Match Results Structure:
```javascript
{
  matches: [
    {
      id: string,
      players: [Player, Player],
      winner: Player
    }
  ],
  winner: Player
}
```

## Error Handling
- Failed tournament start: Shows error message
- Match update failure: Retries or shows error
- Connection issues: Implements retry mechanism

## Security Considerations
- Validates player data
- Verifies match results
- Authenticates API calls
- Prevents unauthorized updates
