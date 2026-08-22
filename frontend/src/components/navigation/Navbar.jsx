import { BusFront, Menu, UserRound } from "lucide-react";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-brand">
          <div className="brand-icon">
            <BusFront size={20} />
          </div>

          <span>TransitIQ</span>
        </a>

        <nav className="navbar-links">
          <a href="/" className="active">
            Home
          </a>
          <a href="/plan">Plan Trip</a>
          <a href="/track">Live Buses</a>
          <a href="/routes">Routes</a>
          <a href="/about">About</a>
        </nav>

        <div className="navbar-actions">
          <a href="/login" className="login-button">
            <UserRound size={16} />
            Sign in
          </a>

          <button className="mobile-menu-button">
            <Menu size={21} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;