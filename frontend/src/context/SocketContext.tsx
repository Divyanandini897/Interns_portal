import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  unreadNotifications: number;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      auth: { token },
      query: { token }
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected!');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('⚡ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('new_notification', () => {
      setUnreadNotifications(prev => prev + 1);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user?.id]);

  const incrementUnreadCount = () => setUnreadNotifications(prev => prev + 1);
  const resetUnreadCount = () => setUnreadNotifications(0);

  return (
    <SocketContext.Provider value={{ socket, isConnected, unreadNotifications, incrementUnreadCount, resetUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
