import { Routes, Route } from "react-router-dom";
import Home from './Pages/Home';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import UserProfile from './Pages/UserProfile';
import CreatePost from './components/CreatePost';
import ChatPage from './Pages/ChatPage';
import People from './Pages/People';
import Sessions from './Pages/Sessions';
import ChooseRole from './Pages/ChooseRole';
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { SocketProvider } from './contexts/SocketContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <SocketProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/userprofile"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-post"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/people"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <People />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Sessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/choose-role"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ChooseRole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </SocketProvider>
  );
}

export default App;
