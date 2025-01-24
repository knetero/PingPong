# Game Invitation System - Backend Implementation Guide

## Overview
This document outlines the backend requirements for the game invitation system. The frontend has implemented a real-time game invitation system using WebSocket, and this guide details what the backend needs to handle.

## Frontend Implementation Status
We have implemented:
- Real-time game invitation sending through WebSocket
- Global invitation handling across the application
- Accept/Decline UI and logic
- Automatic game session joining on acceptance

## WebSocket Message Types

### 1. Game Invitation (`game_invitation`)
**Backend should listen for:**
```javascript
{
    type: 'game_invitation',
    friendship_id: string,
    map: string,
    sender_username: string,
    sender_image: string,
    receiver_username: string,
    timestamp: string
}
```
**Backend Actions:**
- Validate friendship exists
- Check if receiver is online
- Create invitation record
- Forward invitation to receiver

### 2. Game Invitation Received (`game_invitation_received`)
**Backend should emit to receiver:**
```javascript
{
    type: 'game_invitation_received',
    friendship_id: string,
    sender_username: string,
    sender_image: string,
    map: string,
    invitation_id: string
}
```

### 3. Game Invitation Response (`game_invitation_response`)
**Frontend sends:**
```javascript
{
    type: 'game_invitation_response',
    friendship_id: string,
    accepted: boolean,
    map?: string  // Only included if accepted is true
}
```

### 4. Game Invitation Error (`game_invitation_error`)
**Backend should send:**
```javascript
{
    type: 'game_invitation_error',
    message: string
}
```

## Required Backend Features

### 1. Database Models
Required models:
- GameInvitation (for tracking invitations)
- GameSession (for active games)

### 2. Core Validations
The backend must validate:
- Friendship exists and is active
- Receiver is online and available
- No duplicate pending invitations exist
- Map selection is valid

### 3. Error Handling
Handle these scenarios:
- Offline users
- Invalid friendships
- Expired invitations
- Connection drops
- Race conditions

### 4. Game Session Management
When an invitation is accepted:
1. Create a new game session
2. Initialize game state
3. Notify both players
4. Handle session cleanup if needed

## Implementation Checklist

### Required WebSocket Handlers
- [ ] `handle_game_invitation`
- [ ] `handle_invitation_response`
- [ ] `handle_connection_status`

### Required Database Operations
- [ ] Create invitation records
- [ ] Update invitation status
- [ ] Create game sessions
- [ ] Track user online status

### Required Background Tasks
- [ ] Cleanup expired invitations
- [ ] Monitor active game sessions
- [ ] Track connection status

## Security Considerations
1. Validate all WebSocket messages
2. Ensure users can only accept their own invitations
3. Prevent spam invitations
4. Handle rate limiting
5. Validate user sessions

## Performance Requirements
- WebSocket message handling: < 100ms
- Database operations: < 200ms
- Maximum pending invitations per user: 5
- Invitation expiry time: 5 minutes

## Testing Scenarios
Please test these scenarios:
1. Sending invitation to online user
2. Sending invitation to offline user
3. Accepting invitation
4. Declining invitation
5. Connection loss during invitation
6. Multiple simultaneous invitations
7. Invitation expiry
8. Race conditions

## Logging Requirements
Log these events:
- Invitation creation
- Status changes
- Error scenarios
- Game session creation
- Connection status changes

## Error Codes
Implement these error types:
- `USER_OFFLINE`: Receiver is offline
- `INVALID_FRIENDSHIP`: Friendship doesn't exist or inactive
- `DUPLICATE_INVITATION`: Already pending invitation
- `EXPIRED_INVITATION`: Invitation timeout
- `GAME_ERROR`: Game creation failed

## Next Steps
1. Review this documentation
2. Implement database models
3. Create WebSocket handlers
4. Add validation logic
5. Implement error handling
6. Add logging
7. Create background tasks
8. Test all scenarios
