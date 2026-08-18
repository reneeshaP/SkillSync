import { Navigate, useLocation } from "react-router-dom";
import PropTypes from 'prop-types';
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // First-time Google signups land with a placeholder role — keep them on
  // the role picker until they confirm it, no matter what page they hit.
  if (user?.roleConfirmed === false && location.pathname !== '/choose-role') {
    return <Navigate to="/choose-role" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;