import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { CallProvider } from "./context/CallContext.jsx";
import { PresenceProvider } from "./context/PresenceContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import CallOverlay from "./components/CallOverlay.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import AppLockGate from "./components/AppLockGate.jsx";
import BackButtonHandler from "./components/BackButtonHandler.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Chat from "./pages/Chat.jsx";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen fullScreen message="Aapki profile load ho rahi hai..." />;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen fullScreen message="Bas ek second..." />;

  return (
    <ThemeProvider>
      <PresenceProvider>
        <CallProvider>
          <AppLockGate>
            <BackButtonHandler />
            <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/" replace /> : <Register />}
            />
            <Route
              path="/forgot-password"
              element={user ? <Navigate to="/" replace /> : <ForgotPassword />}
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              }
            />
          </Routes>
          <CallOverlay />
          </AppLockGate>
        </CallProvider>
      </PresenceProvider>
    </ThemeProvider>
  );
}
