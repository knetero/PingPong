# WebSocket Service Documentation

## Overview
The WebSocket service provides real-time bidirectional communication between the client and server. It's implemented as a singleton service with a React context wrapper for easy integration with React components.

## Architecture

### WebSocket Service
Located at: `/src/app/services/websocket.js`

Core features:
- Single WebSocket connection for the entire application
- Automatic reconnection (max 5 attempts)
- Ping/pong connection health checks
- Message distribution to multiple handlers
- Error handling and logging

### WebSocket Context
Located at: `/src/app/contexts/WebSocketProvider.tsx`

The WebSocket context provides a React-friendly way to access WebSocket functionality throughout your application:
```typescript
interface WebSocketContextType {
    addHandler: (handler: (data: any) => void) => void;
    removeHandler: (handler: (data: any) => void) => void;
    send: (message: any) => void;
    isConnected: () => boolean;
}
```

## Usage


### Using WebSocket in Components
Use the `useWebSocket` hook to access WebSocket functionality:

```jsx
import { useWebSocket } from '../contexts/WebSocketProvider';

function YourComponent() {
  const { send, addHandler, removeHandler, isConnected } = useWebSocket();

  // Send a message
  const handleAction = () => {
    send({
      type: 'YOUR_ACTION',
      data: 'your data'
    });
  };

  // Listen for messages
  useEffect(() => {
    const handleMessage = (data) => {
      if (data.type === 'YOUR_EVENT') {
        // Handle the message
      }
    };

    addHandler(handleMessage);
    return () => removeHandler(handleMessage);
  }, [addHandler, removeHandler]);

  return (
    // Your component JSX
  );
}
```


## Common Use Cases

1. **Friend Management**
   ```jsx
   send({
     type: 'friends-accept',
     friendship_id: id
   });
   ```

2. **Chat Messages**
   ```jsx
   send({
     type: 'messages',
     friendship_id: id
   });
   ```

3. **Game Invitations**
   ```jsx
   send({
     type: 'GAME_INVITE',
     friendship_id: id,
     message: 'Game invitation'
   });
   ```
