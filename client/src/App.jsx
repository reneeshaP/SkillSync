import { Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Home from './Pages/Home';
import Landing from './Pages/Landing';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import UserProfile from './Pages/UserProfile';
import CreatePost from './components/CreatePost';
import ChatPage from './Pages/ChatPage';
import People from './Pages/People';
import Sessions from './Pages/Sessions';
import ChooseRole from './Pages/ChooseRole';
import Onboarding from './Pages/Onboarding';
import ViewProfile from './Pages/ViewProfile';
import NotFound from './Pages/NotFound';
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from './components/layout/AppShell';
import { useAuth } from "./context/AuthContext";
import { SocketProvider } from './contexts/SocketContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <MotionConfig reducedMotion="user">
    <SocketProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/choose-role"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ChooseRole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/feed" element={<Home />} />
          <Route path="/people" element={<People />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/userprofile" element={<UserProfile />} />
          <Route path="/profile/:id" element={<ViewProfile />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </SocketProvider>
    </MotionConfig>
  );
}

export default App;
