# Tournament WebSocket Protocol - Frontend Implementation

## Overview
This document describes how the frontend implements WebSocket communication for tournaments. Backend developers should be aware of these patterns to ensure compatible server implementation.

## WebSocket Connection Details

### Connection Endpoint
```
ws://10.11.6.4:8001/ws/tournament/tour/PLAY/
```

### Frontend Behavior
1. The frontend maintains a single, persistent WebSocket connection
2. Connection is reused for all tournament-related communications
3. If connection is lost, frontend will attempt to reconnect

## Message Types and Handling

### 1. Join Tournament
When user clicks "Join Tournament", frontend sends:
```javascript
{
  "type": "join_tournament",
  "data": {
    "userId": number,      // User's ID from authentication
    "username": string,    // User's display name
    "mapType": string     // Selected map type
  }
}
```

Frontend expects one of these responses:
```javascript
// Success case
{
  "type": "join_tournament_response",
  "success": true,
  "tournamentId": string,
  "message": string
}

// Error case
{
  "type": "join_tournament_response",
  "success": false,
  "error": string
}
```

### 2. Tournament Updates
Frontend listens for and processes all tournament-related messages. Any message received will update the tournament UI. Expected format:
```javascript
{
  "matches": Array,         // Match information for bracket display
  "players": Array,         // Current players in tournament
  "width": number,         // Bracket width (used for UI layout)
  "height": number,        // Bracket height (used for UI layout)
  "is_tournament": boolean // Must be true for tournament updates
}
```

### 3. Game Start
When a match is ready, frontend expects:
```javascript
{
  "type": "game_start",
  "gameId": string        // Frontend will redirect players to /game/{gameId}
}
```

## Frontend State Management

### Connection States
- Frontend checks WebSocket state before sending messages
- Messages sent only when connection is OPEN (readyState === 1)
- Frontend will show error UI if connection is lost

### Event Listeners
- Frontend maintains listeners for all tournament updates
- All received messages are processed and update the UI
- No filtering by message type - backend should only send relevant messages

### Cleanup Behavior
- Frontend removes event listeners when user leaves tournament
- WebSocket connection is closed when user leaves app
- Backend should handle these disconnections appropriately

## Important Notes for Backend Implementation

1. **Message Timing**
   - Frontend expects immediate response to join requests
   - Tournament updates can arrive at any time
   - Game start messages must arrive after both players are ready

2. **Error Handling**
   - Frontend displays error messages directly from backend
   - Include descriptive error messages in error responses
   - Frontend will retry connection if lost

3. **State Synchronization**
   - Frontend relies on backend for tournament state
   - Send complete tournament state in each update
   - Include all necessary data for bracket visualization

4. **Connection Management**
   - Frontend uses single connection per user
   - Backend should handle multiple connections from same user
   - Clean up server resources on disconnection

## Common Scenarios

### User Joins Tournament
1. Frontend sends join request
2. Backend validates request
3. Backend sends success/error response
4. If success, backend broadcasts updated tournament state

### Match Starts
1. Backend determines match pairing
2. Backend sends game_start message
3. Frontend automatically redirects players

### Connection Lost
1. Frontend attempts reconnection
2. Backend should preserve tournament state
3. Backend should handle rejoining gracefully
