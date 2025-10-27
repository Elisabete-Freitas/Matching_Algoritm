import React, { createContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory for navigation
import runOneSignal from '../services/oneSignalConfig';

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  token: null,
  loginUser: () => {},
  logoutUser: () => {},
});

export const AuthProvider = ({ children }) => {
    const history = useHistory();
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        return isLoggedIn === "true"; 
    });
    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        const isLoggedIn = localStorage.getItem('isLoggedIn');

        if (storedToken && storedUser && isLoggedIn) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(JSON.parse(isLoggedIn));
        }
    }, []);

    const loginUser = (userData) => {
        localStorage.setItem('isLoggedIn', "true");
        localStorage.setItem('user', JSON.stringify(userData)); 
        setUser(userData);
        setIsAuthenticated(true);
        runOneSignal();
        switch (userData.role) {
            case 'beekeeper':
                history.push('/dashboard-beekeeper');
                break;
            case 'farmer':
                history.push('/dashboard-farmer');
                break;
            case 'admin':
                    history.push('/dashboard-admin');
                    break;
            default:
                history.push('/login');
        }
    };
    
    const logoutUser = () => {
        window.location.href = '/login';
        localStorage.clear();
    };
    
    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loginUser, logoutUser, token }}>
            {children}
        </AuthContext.Provider>
    );
};
