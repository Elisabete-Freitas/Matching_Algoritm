import React, { useContext, useEffect, useState } from 'react';
import { NotificationsContext } from '../context/NotificationsContext';
import { URL } from '../../config';
import './NotificationsPage.css';
import Spinner from '../shared/Spinner';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const NotificationsPage = () => {
  const { markAsRead, fetchUnreadCount } = useContext(NotificationsContext);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [totalPages, setTotalPages] = useState(0);

  const userId = JSON.parse(localStorage.getItem("user")).id;

  useEffect(() => {
    setRowsPerPage(calculateRowsPerPage());
    fetchNotifications();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentPage, rowsPerPage]);

  const handleResize = () => {
    setRowsPerPage(calculateRowsPerPage());
  };

  const calculateRowsPerPage = () => {
    const cardHeight = 110; // Approximate height of each notification card in pixels
    const availableHeight = window.innerHeight; // Subtract some pixels for other page elements
    return Math.max(1, Math.floor(availableHeight / cardHeight)); // Ensure at least one row per page
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${URL}/beeland-api/messages/user/${userId}?page=${currentPage}&limit=${rowsPerPage}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data.data);
      setTotalPages(Math.ceil(data.total / rowsPerPage));
    } catch (error) {
      setError(error.message);
      console.error('Error fetching notifications:', error);
    }
    setIsLoading(false);
  };

  const handleMarkAsRead = async (messageId) => {
    await markAsRead(messageId);
    fetchNotifications(); // Refresh notifications after marking as read
    fetchUnreadCount(); // Update unread count in the bell icon
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbers = 3; // Display 3 page numbers at a time
    const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
    const endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="notifications-content-layout">
      <h1 className="notifications-content-title">Notificações</h1>
      <div className="cards-wrapper">
        {error && <p className="error-message">Erro: {error}</p>}
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification._id} className={`notification-card ${notification.status === 'sent' ? 'unread' : ''}`}>
              <div className="notification-content">
              {notification.status === 'sent' && <span className="new-tag">NOVO</span>}
                <p className="notification-timestamp">{new Date(notification.createdAt).toLocaleString()}</p>
                <p className="notification-message">{notification.content}</p>
              {notification.status === 'sent' && (
                <button 
                  className="mark-as-read-btn"
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  Marcar como lida
                </button>
              )}
              </div>
            </div>
          ))
        ) : (
          <p>Sem notificações.</p>
        )}
      </div>
      <div className="pagination-controls">
        <button
          className="pagination-arrow"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <FaArrowLeft />
        </button>
        {renderPageNumbers()}
        <button
          className="pagination-arrow"
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default NotificationsPage;
