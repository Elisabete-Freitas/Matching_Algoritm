import React, {useContext} from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from './auth/AuthContext';

function ProtectedRoute({ component: Component, allowedRoles, ...rest }) {
  const { isAuthenticated, user } = useContext(AuthContext);

  //console.log("Authenticated:", isAuthenticated, "User:", user); 

  return (
    <Route
      {...rest}
      render={props => {
        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        } else if (isAuthenticated && !allowedRoles.includes(user.role)) { 
          return <Redirect to="/forbidden" />;
        }
        return <Component {...props} />;
      }}
    />
  );
};


export default ProtectedRoute;
