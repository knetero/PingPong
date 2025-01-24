import { createContext, useContext, useEffect } from 'react';
import websocketService from '../services/websocket';

interface WebSocketContextType {
    addHandler: (handler: (data: any) => void) => void;
    removeHandler: (handler: (data: any) => void) => void;
    send: (message: any) => void;
    isConnected: () => boolean;
    disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
    addHandler: () => {},
    removeHandler: () => {},
    send: () => {},
    isConnected: () => false,
    disconnect: () => {},
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Connect WebSocket when component mounts
        websocketService.connect();

        // Properly disconnect when component unmounts
        return () => {
            // console.log('WebSocket Provider unmounting - disconnecting WebSocket');
            websocketService.disconnect();
        };
    }, []);

    const value = {
        addHandler: websocketService.addHandler,
        removeHandler: websocketService.removeHandler,
        send: websocketService.send,
        isConnected: websocketService.isConnected,
        disconnect: websocketService.disconnect,
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
}

export const useWebSocket = () => useContext(WebSocketContext);
