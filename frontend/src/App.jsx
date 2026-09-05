import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import PassengerDashboard from "./pages/passenger/PassengerDashboard";
import DriverDashboard from "./pages/driver/DriverDashboard";
import OperatorDashboard from "./pages/operator/OperatorDashboard";

// ==========================================
// PROTECTED ROUTE
// ==========================================

function ProtectedRoute({ allowedRole, children }) {
  const token = localStorage.getItem("transitiq_token");
  const userData = localStorage.getItem("transitiq_user");

  // No login information
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userData);

    // User role doesn't match this dashboard
    if (user.role !== allowedRole) {
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch (error) {
    // Invalid saved user data
    localStorage.removeItem("transitiq_token");
    localStorage.removeItem("transitiq_user");

    return <Navigate to="/login" replace />;
  }
}

// ==========================================
// APP
// ==========================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==============================
            PUBLIC
        =============================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ==============================
            PASSENGER
        =============================== */}

        <Route
          path="/passenger"
          element={
            <ProtectedRoute allowedRole="passenger">
              <PassengerDashboard />
            </ProtectedRoute>
          }
        />

        {/* ==============================
            DRIVER
        =============================== */}

        <Route
          path="/driver"
          element={
            <ProtectedRoute allowedRole="driver">
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        {/* ==============================
            OPERATOR
        =============================== */}

        <Route
          path="/operator"
          element={
            <ProtectedRoute allowedRole="operator">
              <OperatorDashboard />
            </ProtectedRoute>
          }
        />

        {/* ==============================
            UNKNOWN URL
        =============================== */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;