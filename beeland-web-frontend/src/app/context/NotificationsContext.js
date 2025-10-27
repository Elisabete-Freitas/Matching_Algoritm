import React, { createContext, useState, useEffect, useContext } from 'react';
import { URL } from '../../config';
import { AuthContext } from '../auth/AuthContext'; // Ensure correct path to AuthContext

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(AuthContext); 

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]); 

  const fetchUnreadCount = async () => {
    if (!user?.id) return; 

    try {
      const response = await fetch(`${URL}/beeland-api/messages/unread-count/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch unread count');
      const data = await response.json();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (messageId) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${URL}/beeland-api/messages/mark-as-read/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId })
      });
      if (!response.ok) throw new Error('Failed to mark message as read');
      await response.json();
      fetchUnreadCount(); // Refresh the unread count
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return (
    <NotificationsContext.Provider value={{ unreadCount, fetchUnreadCount, markAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
};
