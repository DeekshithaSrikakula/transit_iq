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
} from "lucide-react";
import { useState } from "react";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
              JOIN TRANSITIQ
            </span>

            <h1>
              Your city.
              <br />
              Your journey.
              <br />
              <span>One platform.</span>
            </h1>

            <p>
              Create your TransitIQ account and make travelling
              around Hyderabad simpler, smarter, and more predictable.
            </p>

            <div className="register-benefits">
              <div>
                <CheckCircle2 size={18} />
                <span>Find the best bus routes</span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>Track buses in real time</span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>Save your favourite journeys</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            RIGHT REGISTER SECTION
        ========================== */}

        <section className="auth-form-section">
          <a href="/login" className="back-link">
            <ArrowLeft size={16} />
            Back to sign in
          </a>

          <div className="login-card register-card">

            <div className="login-heading">
              <span>CREATE ACCOUNT</span>

              <h2>Join TransitIQ</h2>

              <p>
                Create your passenger account to start exploring
                Hyderabad.
              </p>
            </div>

            <form>

              {/* Full name */}

              <div className="form-group">
                <label htmlFor="name">
                  Full name
                </label>

                <div className="input-wrapper">
                  <UserRound size={18} />

                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}

              <div className="form-group">
                <label htmlFor="register-email">
                  Email address
                </label>

                <div className="input-wrapper">
                  <Mail size={18} />

                  <input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Phone */}

              <div className="form-group">
                <label htmlFor="phone">
                  Mobile number
                </label>

                <div className="input-wrapper">
                  <Phone size={18} />

                  <input
                    id="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              {/* Password */}

              <div className="form-group">
                <label htmlFor="register-password">
                  Password
                </label>

                <div className="input-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
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

              {/* Confirm password */}

              <div className="form-group">
                <label htmlFor="confirm-password">
                  Confirm password
                </label>

                <div className="input-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword ? (
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
                Create account
              </button>

            </form>

            <div className="signup-text">
              Already have an account?
              <a href="/login">
                Sign in
              </a>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}

export default Register;