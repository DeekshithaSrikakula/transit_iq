import {
  ArrowLeft,
  BusFront,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  Truck,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("passenger");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Remove any old login information first.
      // This prevents an old valid token from being reused.
      localStorage.removeItem("transitiq_token");
      localStorage.removeItem("transitiq_user");

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            password: password,
            role: role,
          }),
        }
      );

      const data = await response.json();

      console.log("Login response:", data);
      console.log("Login status:", response.status);

      // ==========================================
      // LOGIN FAILED
      // ==========================================

      if (!response.ok || data.success !== true) {
        setError(
          data.message || "Invalid email, password or role"
        );

        setLoading(false);

        // VERY IMPORTANT:
        // Stop here. Do NOT navigate.
        return;
      }

      // ==========================================
      // CHECK TOKEN
      // ==========================================

      if (!data.token) {
        setError("Login failed. No authentication token received.");
        setLoading(false);
        return;
      }

      // ==========================================
      // CHECK USER
      // ==========================================

      if (!data.user || !data.user.role) {
        setError("Login failed. User information is missing.");
        setLoading(false);
        return;
      }

      // ==========================================
      // CHECK ROLE
      // ==========================================

      if (data.user.role !== role) {
        setError("Selected role does not match the account.");
        setLoading(false);
        return;
      }

      // ==========================================
      // LOGIN SUCCESSFUL
      // ==========================================

      localStorage.setItem(
        "transitiq_token",
        data.token
      );

      localStorage.setItem(
        "transitiq_user",
        JSON.stringify(data.user)
      );

      console.log("Login successful");
      console.log("User:", data.user);
      console.log("Role:", data.user.role);

      // ==========================================
      // ROLE-BASED REDIRECT
      // ==========================================

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

          setError("Invalid user role.");
          break;
      }

    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CHANGE ROLE
  // ==========================================

  const changeRole = (newRole) => {
    setRole(newRole);
    setError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* =====================================
            LEFT SECTION
        ====================================== */}

        <section className="auth-visual">

          <a href="/" className="auth-brand">

            <div className="auth-brand-icon">
              <BusFront size={20} />
            </div>

            TransitIQ

          </a>

          <div className="auth-visual-content">

            <span className="auth-eyebrow">
              SMART URBAN MOBILITY
            </span>

            <h1>
              Move around
              <br />
              Hyderabad <span>smarter.</span>
            </h1>

            <p>
              Plan your journey, discover better routes,
              and track your bus in real time.
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

        </section>

        {/* =====================================
            RIGHT LOGIN SECTION
        ====================================== */}

        <section className="auth-form-section">

          <a href="/" className="back-link">

            <ArrowLeft size={16} />

            Back to home

          </a>

          <div className="login-card">

            {/* =================================
                HEADING
            ================================== */}

            <div className="login-heading">

              <span>
                WELCOME BACK
              </span>

              <h2>
                Sign in to TransitIQ
              </h2>

              <p>
                Access your journeys, live buses,
                and saved routes.
              </p>

            </div>

            {/* =================================
                ROLE SELECTOR
            ================================== */}

            <div className="role-selector">

              {/* PASSENGER */}

              <button
                type="button"
                className={
                  role === "passenger"
                    ? "role-option active"
                    : "role-option"
                }
                onClick={() =>
                  changeRole("passenger")
                }
              >
                <UserRound size={16} />
                <span>Passenger</span>
              </button>

              {/* DRIVER */}

              <button
                type="button"
                className={
                  role === "driver"
                    ? "role-option active"
                    : "role-option"
                }
                onClick={() =>
                  changeRole("driver")
                }
              >
                <BusFront size={16} />
                <span>Driver</span>
              </button>

              {/* OPERATOR */}

              <button
                type="button"
                className={
                  role === "operator"
                    ? "role-option active"
                    : "role-option"
                }
                onClick={() =>
                  changeRole("operator")
                }
              >
                <Truck size={16} />
                <span>Operator</span>
              </button>

            </div>

            {/* =================================
                ERROR
            ================================== */}

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {/* =================================
                FORM
            ================================== */}

            <form onSubmit={handleLogin}>

              {/* EMAIL */}

              <div className="form-group">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">

                  <Mail size={18} />

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="form-group">

                <div className="password-label">

                  <label htmlFor="password">
                    Password
                  </label>

                  <a href="/forgot-password">
                    Forgot password?
                  </a>

                </div>

                <div className="input-wrapper">

                  <LockKeyhole size={18} />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* =================================
                  SUBMIT
              ================================== */}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}
              </button>

            </form>

            {/* =================================
                REGISTER
            ================================== */}

            <div className="signup-text">

              Don't have an account?

              <a href="/register">
                Create an account
              </a>

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}

export default Login;