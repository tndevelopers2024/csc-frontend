import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only connect if there is a token (user is logged in)
    const token = localStorage.getItem('token');
    
    // Connect to backend
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
    const newSocket = io(baseUrl, {
      autoConnect: true,
      reconnection: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      
      // If user is logged in, join their specific room.
      // We will also rely on individual components to emit joinRoom if they have the ID.
      // A common pattern is to let DashboardHome emit the joinRoom with the user's ID
      // or admin status.
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
