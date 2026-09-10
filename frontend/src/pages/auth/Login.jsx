import {
  ArrowLeft,
  BusFront,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  Radio,
  Shield,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("passenger");
  const [email, setEmail] = useState("passenger@test.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      localStorage.removeItem("transitiq_token");
      localStorage.removeItem("transitiq_user");

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success !== true) {
        setError(data.message || "Invalid email, password or role selection.");
        setLoading(false);
        return;
      }

      if (!data.token) {
        setError("Login failed. No authentication token received.");
        setLoading(false);
        return;
      }

      if (!data.user || !data.user.role) {
        setError("Login failed. User profile data is missing.");
        setLoading(false);
        return;
      }

      if (data.user.role !== role) {
        setError("Selected role does not match this account.");
        setLoading(false);
        return;
      }

      localStorage.setItem("transitiq_token", data.token);
      localStorage.setItem("transitiq_user", JSON.stringify(data.user));

      switch (data.user.role) {
        case "passenger":
          navigate("/passenger", { replace: true });
          break;
        case "driver":
          navigate("/driver", { replace: true });
          break;
        case "operator":
          navigate("/operator", { replace: true });
          break;
        default:
          localStorage.removeItem("transitiq_token");
          localStorage.removeItem("transitiq_user");
          setError("Unrecognized account role.");
          break;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to the transit backend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const changeRole = (newRole) => {
    setRole(newRole);
    setError("");
    if (newRole === "passenger") {
      setEmail("passenger@test.com");
      setPassword("password");
    } else if (newRole === "driver") {
      setEmail("driver@test.com");
      setPassword("password");
    } else if (newRole === "operator") {
      setEmail("operator@test.com");
      setPassword("password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* ===================================================
            LEFT BRAND VISUAL
            =================================================== */}
        <section className="auth-visual">
          <Link to="/" className="auth-brand">
            <div className="auth-brand-icon">
              <BusFront size={20} />
            </div>
            <span>TransitIQ</span>
          </Link>

          <div className="auth-visual-content">
            <span className="auth-eyebrow">SMART URBAN MOBILITY</span>

            <h1>
              Move around
              <br />
              Hyderabad <span>smarter.</span>
            </h1>

            <p>
              Plan your journeys, discover optimal corridors, and track live transit
              fleets across the metropolitan network in real time.
            </p>

            <div className="auth-stats">
              <div>
                <strong>128+</strong>
                <span>Active buses</span>
              </div>
              <div>
                <strong>42</strong>
                <span>Routes</span>
              </div>
              <div>
                <strong>1,240+</strong>
                <span>Stops</span>
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "var(--text-subtle)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span className="beacon-dot"></span>
            <span>Live Telemetry Grid Active</span>
          </div>
        </section>

        {/* ===================================================
            RIGHT FORM SECTION
            =================================================== */}
        <section className="auth-form-section">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </Link>

          <div className="login-heading">
            <span>WELCOME BACK</span>
            <h2>Sign in to TransitIQ</h2>
            <p>Access your real-time journeys, driver cockpit, or fleet radar.</p>
          </div>

          {/* Role selector */}
          <div className="role-selector">
            <button
              type="button"
              className={role === "passenger" ? "role-option active" : "role-option"}
              onClick={() => changeRole("passenger")}
            >
              <UserRound size={15} />
              <span>Passenger</span>
            </button>

            <button
              type="button"
              className={role === "driver" ? "role-option active" : "role-option"}
              onClick={() => changeRole("driver")}
            >
              <Radio size={15} />
              <span>Driver</span>
            </button>

            <button
              type="button"
              className={role === "operator" ? "role-option active" : "role-option"}
              onClick={() => changeRole("operator")}
            >
              <Shield size={15} />
              <span>Operator</span>
            </button>
          </div>

          {/* Quick Demo Hint */}
          <div
            style={{
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "12px",
              color: "#c7d2fe",
            }}
          >
            <Sparkles size={16} color="#818cf8" style={{ flexShrink: 0 }} />
            <span>
              <strong>Demo credentials preloaded:</strong> Just click &ldquo;Sign in&rdquo; below or switch roles above to test!
            </span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input-wrapper">
                <Mail size={17} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="password-label">
                <label htmlFor="password">Password</label>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                  }}
                  onClick={() => setPassword("password")}
                >
                  Reset to default
                </span>
              </div>
              <div className="input-wrapper">
                <LockKeyhole size={17} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Signing in..." : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>
          </form>

          <div className="signup-text">
            Don&apos;t have an account yet?
            <Link to="/register">Create an account</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;