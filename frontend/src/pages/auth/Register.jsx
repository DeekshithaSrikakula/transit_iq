import {
  ArrowLeft,
  BusFront,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
  Radio,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("passenger");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // In local mode or with backend API
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        // If register endpoint isn't supported or returns message, still provide helpful fallback
        setError(data.message || "Registration failed. Try signing in with preloaded demo accounts.");
        setLoading(false);
        return;
      }

      setSuccess("Account successfully registered! Redirecting to sign in...");
      setTimeout(() => {
        navigate("/login", { state: { email: email.trim(), role } });
      }, 1200);
    } catch {
      // If endpoint is unreachable, show clear error
      setError("Unable to connect to transit server. You can sign in immediately using preloaded demo accounts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* ===================================================
            LEFT VISUAL SECTION
            =================================================== */}
        <section className="auth-visual">
          <Link to="/" className="auth-brand">
            <div className="auth-brand-icon">
              <BusFront size={20} />
            </div>
            <span>TransitIQ</span>
          </Link>

          <div className="auth-visual-content">
            <span className="auth-eyebrow">JOIN TRANSITIQ</span>

            <h1>
              Your city.
              <br />
              Your journey.
              <br />
              <span>One platform.</span>
            </h1>

            <p>
              Create your TransitIQ account to experience predictable travel,
              real-time arrival estimates, and intelligent corridors across Hyderabad.
            </p>

            <div className="register-benefits">
              <div>
                <CheckCircle2 size={18} />
                <span>Find the best bus corridors with live frequencies</span>
              </div>
              <div>
                <CheckCircle2 size={18} />
                <span>Track vehicle GPS telemetry in sub-second intervals</span>
              </div>
              <div>
                <CheckCircle2 size={18} />
                <span>Access specialized Driver cockpit and Operator radar</span>
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
            <span>Enterprise Transit Network • Hyderabad</span>
          </div>
        </section>

        {/* ===================================================
            RIGHT FORM SECTION
            =================================================== */}
        <section className="auth-form-section">
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to sign in</span>
          </Link>

          <div className="login-heading">
            <span>CREATE ACCOUNT</span>
            <h2>Join TransitIQ</h2>
            <p>Create your credentials to access the mobility platform.</p>
          </div>

          {/* Role selector */}
          <div className="role-selector">
            <button
              type="button"
              className={role === "passenger" ? "role-option active" : "role-option"}
              onClick={() => setRole("passenger")}
            >
              <UserRound size={15} />
              <span>Passenger</span>
            </button>
            <button
              type="button"
              className={role === "driver" ? "role-option active" : "role-option"}
              onClick={() => setRole("driver")}
            >
              <Radio size={15} />
              <span>Driver</span>
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#6ee7b7",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "16px",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <div className="input-wrapper">
                <UserRound size={17} />
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. Anand Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email address</label>
              <div className="input-wrapper">
                <Mail size={17} />
                <input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Mobile number</label>
              <div className="input-wrapper">
                <Phone size={17} />
                <input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <div className="input-wrapper">
                <LockKeyhole size={17} />
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm password</label>
              <div className="input-wrapper">
                <LockKeyhole size={17} />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Creating account..." : "Complete Registration"}
            </button>
          </form>

          <div className="signup-text">
            Already have an account?
            <Link to="/login">Sign in</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;