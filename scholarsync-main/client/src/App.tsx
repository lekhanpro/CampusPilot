import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import GlassLayout from "./components/GlassLayout";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/Auth";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const isGitHubPages = window.location.hostname.endsWith("github.io");
  const Router = isGitHubPages ? HashRouter : BrowserRouter;

  return (
    <Router>
      <AuthProvider>
        <GlassLayout>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </GlassLayout>
      </AuthProvider>
    </Router>
  );
}
