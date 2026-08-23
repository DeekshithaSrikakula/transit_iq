import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PassengerDashboard from "./pages/passenger/PassengerDashboard";
import DriverDashboard from "./pages/driver/DriverDashboard";
import OperatorDashboard from "./pages/operator/OperatorDashboard";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Passenger */}
        <Route
          path="/passenger"
          element={<PassengerDashboard />}
        />

        {/* Driver */}
        <Route
          path="/driver"
          element={<DriverDashboard />}
        />
        <Route
  path="/operator"
  element={<OperatorDashboard />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;