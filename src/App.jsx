import "./index.css";
import LoginPage from "./Login/LoginPage";
import Dashboard from "./Dashboard/Dashboard";
import { Routes, Route, Navigate } from "react-router-dom";
import UserProvider from "./context/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <UserProvider>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </UserProvider>
  );
}

export default App;
