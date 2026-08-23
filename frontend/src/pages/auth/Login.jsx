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

  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();

    // Temporary frontend login.
    // Backend authentication will be connected later.

    if (role === "passenger") {
      navigate("/passenger");
    }

    if (role === "driver") {
      navigate("/driver");
    }

    if (role === "operator") {
      navigate("/operator");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* =========================
            LEFT VISUAL SECTION
        ========================== */}

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
              Plan your journey, discover better routes, and
              track your bus in real time.
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

        {/* =========================
            RIGHT LOGIN SECTION
        ========================== */}

        <section className="auth-form-section">

          <a href="/" className="back-link">
            <ArrowLeft size={16} />
            Back to home
          </a>

          <div className="login-card">

            {/* Heading */}

            <div className="login-heading">

              <span>WELCOME BACK</span>

              <h2>
                Sign in to TransitIQ
              </h2>

              <p>
                Access your journeys, live buses, and saved routes.
              </p>

            </div>

            {/* =========================
                ROLE SELECTOR
            ========================== */}

            <div className="role-selector">

              <button
                type="button"
                className={
                  role === "passenger"
                    ? "role-option active"
                    : "role-option"
                }
                onClick={() => setRole("passenger")}
              >
                <UserRound size={16} />
                <span>Passenger</span>
              </button>

              <button
                type="button"
                className={
                  role === "driver"
                    ? "role-option active"
                    : "role-option"
                }
                onClick={() => setRole("driver")}
              >
                <BusFront size={16} />
                <span>Driver</span>
              </button>

              <button
                type="button"
                className={
                  role === "operator"
                    ? "role-option active"
                    : "role-option"
                }
                onClick={() => setRole("operator")}
              >
                <Truck size={16} />
                <span>Operator</span>
              </button>

            </div>

            {/* =========================
                LOGIN FORM
            ========================== */}

            <form onSubmit={handleLogin}>

              {/* Email */}

              <div className="form-group">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">

                  <Mail size={18} />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    required
                  />

                </div>

              </div>

              {/* Password */}

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
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
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

              {/* Submit */}

              <button
                type="submit"
                className="auth-submit"
              >
                Sign in
              </button>

            </form>

            {/* Register */}

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