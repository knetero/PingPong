# Game Invitation System Documentation

## Overview
The game invitation system allows users to send and receive game invitations in real-time using WebSocket connections. The system handles duplicate invitations, manages invitation states, and provides real-time notifications to users.

## System Components

### 1. WebSocket Connection
- Each user maintains a WebSocket connection to receive real-time updates
- Connection is established when user logs in
- Connection URL: `ws://10.13.7.8:8000/ws/user_data/`

### 2. Data Structures

#### Game Invitation Message Format
```json
{
  "type": "game_invitation_received",
  "sender_username": "string",
  "sender_image": "string",
  "map": "string",
  "friendship_id": "number"
}
```

#### Notification Event Format
```json
{
  "id": "timestamp",
  "type": "game_invitation",
  "avatar": "string",
  "message": "string",
  "timestamp": "ISO string",
  "isNew": true,
  "senderUsername": "string"
}
```

## Backend Implementation

### 1. WebSocket Connection Handler
```python
@websocket_route('/ws/user_data/')
async def handle_websocket(websocket):
    try:
        # Authenticate user
        user = await authenticate_websocket(websocket)
        
        # Add to active connections
        active_connections[user.id] = websocket
        
        while True:
            # Listen for messages
            message = await websocket.receive_json()
            await handle_message(user, message)
            
    except WebSocketDisconnect:
        # Clean up connection
        if user.id in active_connections:
            del active_connections[user.id]
```

### 2. Game Invitation Handler
```python
async def handle_game_invitation(sender, receiver_id, map_id):
    try:
        # Validate invitation
        if not can_send_invitation(sender, receiver_id):
            raise ValidationError("Cannot send invitation")
            
        # Get friendship details
        friendship = await get_friendship(sender.id, receiver_id)
        
        # Create invitation message
        invitation = {
            "type": "game_invitation_received",
            "sender_username": sender.username,
            "sender_image": sender.profile_image,
            "map": map_id,
            "friendship_id": friendship.id
        }
        
        # Send to receiver if online
        if receiver_id in active_connections:
            await active_connections[receiver_id].send_json(invitation)
            
        # Store invitation in database
        await store_invitation(sender.id, receiver_id, map_id)
        
    except Exception as e:
        log_error("Game invitation failed", e)
```

### 3. Invitation State Management
```python
async def store_invitation(sender_id, receiver_id, map_id):
    """Store game invitation in database"""
    invitation = GameInvitation(
        sender_id=sender_id,
        receiver_id=receiver_id,
        map_id=map_id,
        status='pending',
        created_at=datetime.now()
    )
    await invitation.save()
```

## Security Measures

1. **Duplicate Prevention**
   - Frontend maintains a Set of recent invitations
   - Invitations are deduplicated using a unique key: `${sender_username}-${friendship_id}`
   - Duplicates are automatically discarded within a 2-second window

2. **Validation Checks**
   ```python
   def can_send_invitation(sender, receiver_id):
       # Check if users are friends
       friendship = get_friendship(sender.id, receiver_id)
       if not friendship:
           return False
           
       # Check if receiver is online
       if receiver_id not in active_connections:
           return False
           
       # Check rate limiting
       if has_exceeded_rate_limit(sender.id):
           return False
           
       return True
   ```

3. **Rate Limiting**
   - Users are limited to sending X invitations per minute
   - Rate limits are tracked per user in Redis/cache

## Database Schema

### Game Invitations Table
```sql
CREATE TABLE game_invitations (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    map_id INTEGER REFERENCES maps(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

1. **WebSocket Disconnection**
   - Clean up user's active connection
   - Mark any pending invitations as expired
   - Notify other relevant users if needed

2. **Invalid Invitations**
   - Validate all incoming invitations
   - Return appropriate error messages
   - Log invalid attempts for security monitoring

## Notification System Integration

1. **Real-time Notifications**
   - Invitations trigger WebSocket events
   - Frontend displays toast notifications
   - Notifications are stored in notification center

2. **Notification Persistence**
   - Store notifications in database
   - Allow users to view history
   - Mark notifications as read/unread

## Best Practices

1. **Performance**
   - Use WebSocket connection pooling
   - Implement proper connection cleanup
   - Cache frequently accessed data

2. **Security**
   - Validate all WebSocket messages
   - Implement proper authentication
   - Rate limit invitation requests

3. **Scalability**
   - Design for horizontal scaling
   - Use message queues for high load
   - Implement proper database indexing

## Testing

1. **Unit Tests**
   ```python
   async def test_game_invitation():
       # Test invitation creation
       invitation = await create_test_invitation()
       assert invitation.status == 'pending'
       
       # Test duplicate prevention
       duplicate = await create_test_invitation()
       assert duplicate is None
       
       # Test invalid invitations
       with pytest.raises(ValidationError):
           await create_invalid_invitation()
   ```

2. **Integration Tests**
   - Test WebSocket connections
   - Test notification delivery
   - Test invitation flow end-to-end

## Monitoring

1. **Metrics to Track**
   - Active WebSocket connections
   - Invitation success/failure rates
   - System latency and performance
   - Error rates and types

2. **Logging**
   - Log all invitation attempts
   - Track security-related events
   - Monitor system health
