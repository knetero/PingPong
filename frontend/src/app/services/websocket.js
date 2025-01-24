// WebSocket service for real-time notifications and friend updates
let ws = null;
let messageHandlers = [];
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;
let keepAliveInterval = null;
let isIntentionalDisconnect = false;


const connectWebSocket = () => {
    if (ws) {
        ws.close();
    }

    if (isIntentionalDisconnect ) {
        return;
    }

    try {
        ws = new WebSocket('wss://10.13.7.8/api/wss/user_data/');

        ws.onopen = () => {
            reconnectAttempts = 0; // Reset reconnection attempts on successful connection
            
            // Clear any existing interval
            if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
            }
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // Handle pong response
                if (data.type === 'pong') {
                    return;
                }

                // Send message to all handlers
                messageHandlers.forEach(handler => {
                    try {
                        handler(data);
                    } catch (error) {
                        console.error('Error in message handler:', error);
                    }
                });
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.onclose = (event) => {
            // Clear the keepalive interval
            if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
                keepAliveInterval = null;
            }
            
            // Only attempt to reconnect if it's not an intentional disconnect
            if (!isIntentionalDisconnect && !event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                setTimeout(connectWebSocket, RECONNECT_INTERVAL);
            }
        };

        // ws.onerror = (error) => {
        //     console.error('WebSocket error:', error);
        // };
    } catch (error) {
        console.error('Error creating WebSocket connection:', error);
    }
};

const disconnect = () => {
    isIntentionalDisconnect = true;
    
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
    }
    
    if (ws) {
        ws.close();
        ws = null;
    }
    
    messageHandlers = [];
    reconnectAttempts = 0;
};

const addMessageHandler = (handler) => {
    if (typeof handler === 'function') {
        messageHandlers.push(handler);
    }
};

const removeMessageHandler = (handler) => {
    messageHandlers = messageHandlers.filter(h => h !== handler);
};

const sendMessage = (message) => {
    if (!message || typeof message !== 'object') {
        console.error('Invalid message format');
        return;
    }

    try {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        } else if (!isIntentionalDisconnect) {
            // Only attempt to reconnect if it's not an intentional disconnect
            if (!ws || ws.readyState === WebSocket.CLOSED) {
                connectWebSocket();
            }
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

const isConnected = () => {
    return ws && ws.readyState === WebSocket.OPEN;
};

// Add a method to reset the intentional disconnect flag
const resetConnection = () => {
    isIntentionalDisconnect = false;
};

export default {
    connect: connectWebSocket,
    disconnect,
    addHandler: addMessageHandler,
    removeHandler: removeMessageHandler,
    send: sendMessage,
    isConnected,
    resetConnection
};
