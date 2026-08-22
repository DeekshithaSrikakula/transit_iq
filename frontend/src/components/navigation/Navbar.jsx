function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        🚍 TransitIQ
      </div>

      <div className="navbar-links">
        <a href="/">Home</a>
        <a href="/track">Track Bus</a>
        <a href="/routes">Routes</a>
        <a href="/about">About</a>
        <a href="/login" className="login-button">
          Login
        </a>
      </div>
    </nav>
  );
}

export default Navbar;