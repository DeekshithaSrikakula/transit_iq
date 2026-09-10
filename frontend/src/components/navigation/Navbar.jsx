import { BusFront, UserRound, Navigation, Radio, Shield, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("transitiq_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {
      setCurrentUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("transitiq_token");
    localStorage.removeItem("transitiq_user");
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <BusFront size={20} />
          </div>
          <span>TransitIQ</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            Home
          </Link>
          <a href="/#journey-planner">Plan Trip</a>
          <Link
            to="/passenger"
            className={location.pathname === "/passenger" ? "active" : ""}
          >
            <Navigation size={14} />
            Live Buses
          </Link>
          <Link
            to="/driver"
            className={location.pathname === "/driver" ? "active" : ""}
          >
            <Radio size={14} />
            Driver Portal
          </Link>
          <Link
            to="/operator"
            className={location.pathname === "/operator" ? "active" : ""}
          >
            <Shield size={14} />
            Operator Radar
          </Link>
        </nav>

        <div className="navbar-actions">
          <div
            className="beacon-live"
            style={{ display: "none", "@media (minWidth: 900px)": { display: "inline-flex" } }}
          >
            <span className="beacon-dot"></span>
            <span style={{ fontSize: "11px", fontWeight: 700 }}>Fleet Online</span>
          </div>

          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link
                to={`/${currentUser.role}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 14px",
                  background: "rgba(99, 102, 241, 0.15)",
                  border: "1px solid rgba(99, 102, 241, 0.35)",
                  borderRadius: "10px",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "6px",
                    background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
                </div>
                <span>{currentUser.name || "My Dashboard"}</span>
              </Link>

              <button
                onClick={handleLogout}
                title="Sign out"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-muted)",
                  padding: "8px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-button">
              <UserRound size={16} />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;