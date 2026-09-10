import { BusFront, Menu, UserRound, Navigation, Radio, Shield } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
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
          <Link to="/" className="active">
            Home
          </Link>
          <a href="#journey-planner">Plan Trip</a>
          <Link to="/passenger">Live Buses</Link>
          <Link to="/driver">Driver Portal</Link>
          <Link to="/operator">Operator Radar</Link>
        </nav>

        <div className="navbar-actions">
          <Link to="/login" className="login-button">
            <UserRound size={16} />
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;