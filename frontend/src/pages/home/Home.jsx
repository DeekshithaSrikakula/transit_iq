import {
  ArrowRight,
  MapPin,
  Navigation,
  Search,
  BusFront,
  Shield,
  Radio,
  Sparkles,
  Zap,
  Clock3,
  Gauge,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/navigation/Navbar";
import SearchBox from "../../components/home/SearchBox";
import TransitMap from "../../components/TransitMap";

const API_BASE = "http://localhost:5000/api";

function Home() {
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [corridorsCount, setCorridorsCount] = useState(2);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch live buses and stops for home radar
    Promise.all([
      fetch(`${API_BASE}/tracking/live-locations`).then((r) => r.json()),
      fetch(`${API_BASE}/routes`).then((r) => r.json()),
      fetch(`${API_BASE}/stops`).then((r) => r.json()),
    ])
      .then(([busData, routesData, stopsData]) => {
        if (Array.isArray(busData)) setBuses(busData);
        if (Array.isArray(routesData)) setCorridorsCount(routesData.length);
        if (Array.isArray(stopsData)) setStops(stopsData);
      })
      .catch(console.error);
  }, []);

  const routeLine = stops.map((s) => [s.latitude, s.longitude]);

  const handleOpenPassenger = () => {
    if (!localStorage.getItem("transitiq_token")) {
      localStorage.setItem("transitiq_token", "demo_passenger");
      localStorage.setItem(
        "transitiq_user",
        JSON.stringify({
          name: "Passenger",
          role: "passenger",
          email: "passenger@test.com",
        })
      );
    }
    navigate("/passenger");
  };

  const handleScrollToPlanner = () => {
    const el = document.getElementById("journey-planner");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        backgroundImage:
          "radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 40%)",
        color: "var(--text-heading)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* ===================================================
            HERO SECTION
            =================================================== */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="status-dot"></span>
              Live Transit Intelligence • Hyderabad
            </div>

            <h1>
              Move smarter.
              <br />
              <span>Travel better.</span>
            </h1>

            <p className="hero-description">
              Find live buses, compare high-frequency corridors, and monitor real-time
              GPS telemetry across Hyderabad with TransitIQ.
            </p>

            <div className="hero-actions">
              <button
                onClick={handleScrollToPlanner}
                className="primary-button"
                style={{ cursor: "pointer" }}
              >
                Plan Your Journey
                <ArrowRight size={18} />
              </button>

              <button
                onClick={handleOpenPassenger}
                className="secondary-button"
                style={{ cursor: "pointer" }}
              >
                <Navigation size={18} color="#06b6d4" />
                Explore Live Fleet
              </button>
            </div>

            {/* Micro Stats Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginTop: "16px",
                padding: "12px 18px",
                background: "rgba(18, 28, 48, 0.5)",
                border: "1px solid var(--border-glass)",
                borderRadius: "14px",
                width: "fit-content",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="beacon-dot"></span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                  {buses.length || 3} Active Buses
                </span>
              </div>
              <span style={{ color: "var(--border-glass)" }}>|</span>
              <div style={{ fontSize: "13px", color: "var(--text-body)" }}>
                <strong style={{ color: "#38bdf8" }}>{corridorsCount}</strong> Major Corridors
              </div>
              <span style={{ color: "var(--border-glass)" }}>|</span>
              <div style={{ fontSize: "13px", color: "var(--text-body)" }}>
                <strong style={{ color: "#34d399" }}>{stops.length || 13}</strong> Monitored Stations
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="map-card">
              <div className="map-header">
                <div>
                  <span className="map-label">LIVE NETWORK RADAR</span>
                  <h3>Hyderabad Metropolitan</h3>
                </div>

                <div className="live-indicator">
                  <span></span>
                  Live Telemetry
                </div>
              </div>

              {/* Real Interactive Map */}
              <div
                style={{
                  height: "280px",
                  borderRadius: "14px",
                  overflow: "hidden",
                  margin: "14px 0",
                  border: "1px solid var(--border-glass)",
                }}
              >
                <TransitMap
                  stops={stops}
                  buses={buses}
                  routeLine={routeLine}
                  height="100%"
                  zoom={11}
                />
              </div>

              <div className="map-footer">
                <div>
                  <strong>{buses.length || 3}</strong>
                  <span>Active Buses</span>
                </div>

                <div>
                  <strong>{corridorsCount}</strong>
                  <span>Corridors</span>
                </div>

                <div>
                  <strong>{stops.length || 13}</strong>
                  <span>Stations</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            PORTALS SELECTOR / ROLE SUITE
            =================================================== */}
        <section
          style={{
            maxWidth: "1280px",
            margin: "0 auto 48px auto",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#38bdf8",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                ROLE-BASED ECOSYSTEM
              </span>
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#ffffff",
                  marginTop: "4px",
                }}
              >
                Tailored Control Suites for Every User
              </h3>
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              One-click instant switch between Passenger, Driver, and Operator portals
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Passenger Card */}
            <div className="portal-card">
              <div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(6, 182, 212, 0.15)",
                    border: "1px solid rgba(6, 182, 212, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#06b6d4",
                    marginBottom: "16px",
                  }}
                >
                  <Navigation size={22} />
                </div>
                <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                  Passenger Live Portal
                </h4>
                <p style={{ fontSize: "14px", color: "var(--text-body)", lineHeight: 1.6, marginBottom: "16px" }}>
                  Real-time interactive Leaflet map, corridor filtering, live station arrival timelines, and GPS distance ETAs.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px", fontSize: "13px", color: "#cbd5e1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={15} color="#06b6d4" /> Dynamic arrival calculations
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={15} color="#06b6d4" /> Secunderabad & IT corridor tracking
                  </div>
                </div>
              </div>
              <button
                onClick={handleOpenPassenger}
                className="btn-primary-glow"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Navigation size={16} /> Open Passenger Live Radar
              </button>
            </div>

            {/* Driver Cockpit Card */}
            <div className="portal-card">
              <div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(99, 102, 241, 0.15)",
                    border: "1px solid rgba(99, 102, 241, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#818cf8",
                    marginBottom: "16px",
                  }}
                >
                  <Radio size={22} />
                </div>
                <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                  Driver Telemetry Cockpit
                </h4>
                <p style={{ fontSize: "14px", color: "var(--text-body)", lineHeight: 1.6, marginBottom: "16px" }}>
                  In-cabin digital speedometer HUD, next stop progress indicator, live GPS telemetry broadcast, and incident dispatch.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px", fontSize: "13px", color: "#cbd5e1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={15} color="#818cf8" /> Real-time GPS intake simulation
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={15} color="#818cf8" /> Instant incident & congestion reporting
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem("transitiq_token", "demo_driver");
                  localStorage.setItem(
                    "transitiq_user",
                    JSON.stringify({
                      name: "Mohammad Ali",
                      role: "driver",
                      email: "driver@test.com",
                    })
                  );
                  navigate("/driver");
                }}
                className="btn-primary-glow"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                }}
              >
                <Radio size={16} /> Launch Driver Cockpit
              </button>
            </div>

            {/* Operator Card */}
            <div className="portal-card">
              <div>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#34d399",
                    marginBottom: "16px",
                  }}
                >
                  <Shield size={22} />
                </div>
                <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                  Operator Command Center
                </h4>
                <p style={{ fontSize: "14px", color: "var(--text-body)", lineHeight: 1.6, marginBottom: "16px" }}>
                  City fleet radar overview, real-time vehicle roster, 4 enterprise KPI metrics, and live incident triage queue.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px", fontSize: "13px", color: "#cbd5e1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={15} color="#34d399" /> Enterprise KPI fleet health telemetry
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={15} color="#34d399" /> Live incident resolution workflow
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem("transitiq_token", "demo_op");
                  localStorage.setItem(
                    "transitiq_user",
                    JSON.stringify({
                      name: "Rajesh Kumar",
                      role: "operator",
                      email: "operator@test.com",
                    })
                  );
                  navigate("/operator");
                }}
                className="btn-primary-glow"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                }}
              >
                <Shield size={16} /> Launch Operator Radar
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            JOURNEY PLANNER / SEARCHBOX
            =================================================== */}
        <SearchBox />

        {/* ===================================================
            HOW IT WORKS (4 STEPS)
            =================================================== */}
        <section className="features-section">
          <div className="section-heading">
            <span>HOW TRANSITIQ OPERATES</span>
            <h2>Your journey, made simple.</h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Search Station</h3>
              <p>Enter your origin and destination station in Hyderabad to discover direct transit options.</p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <h3>Compare Corridors</h3>
              <p>Review frequencies, fare estimates, and stop sequences between historic Hyderabad and IT hubs.</p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <h3>Live Telemetry</h3>
              <p>Watch real-time bus locations glide smoothly across OpenStreetMap with WebSocket updates.</p>
            </div>

            <div className="step-card">
              <div className="step-number">04</div>
              <h3>Predictable Travel</h3>
              <p>Dynamic ETA calculations ensure you arrive on time with zero guesswork or waiting.</p>
            </div>
          </div>

          {/* ===================================================
              WHY TRANSITIQ
              =================================================== */}
          <div className="section-heading">
            <span>WHY TRANSITIQ</span>
            <h2>Enterprise urban mobility intelligence.</h2>
          </div>

          <div className="feature-grid">
            <div
              className="feature-card"
              onClick={handleOpenPassenger}
              style={{ cursor: "pointer" }}
            >
              <div className="feature-icon">
                <Navigation size={24} />
              </div>
              <h3>Live Bus Telemetry</h3>
              <p>
                Sub-second vehicle GPS tracking powered by lightweight WebSockets and high-performance mapping.
              </p>
            </div>

            <div
              className="feature-card"
              onClick={handleScrollToPlanner}
              style={{ cursor: "pointer" }}
            >
              <div className="feature-icon">
                <Search size={24} />
              </div>
              <h3>Smart Route Intelligence</h3>
              <p>
                Intelligent corridor dispatch and connection matching tailored for Hyderabad commuters and IT workforce.
              </p>
            </div>

            <div
              className="feature-card"
              onClick={handleOpenPassenger}
              style={{ cursor: "pointer" }}
            >
              <div className="feature-icon">
                <MapPin size={24} />
              </div>
              <h3>Dynamic Arrival ETAs</h3>
              <p>
                Haversine distance algorithms calculate accurate arrival predictions based on actual road telemetry.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ===================================================
          ENTERPRISE FOOTER
          =================================================== */}
      <footer
        style={{
          borderTop: "1px solid var(--border-glass)",
          background: "rgba(6, 10, 18, 0.95)",
          padding: "40px 24px",
          marginTop: "60px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <BusFront size={20} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "18px", color: "#ffffff" }}>
                TransitIQ
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Urban Transit Intelligence Platform
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "24px", fontSize: "13px", color: "var(--text-body)" }}>
            <Link to="/" style={{ color: "var(--text-body)", textDecoration: "none" }}>Home</Link>
            <Link to="/passenger" style={{ color: "var(--text-body)", textDecoration: "none" }}>Passenger</Link>
            <Link to="/driver" style={{ color: "var(--text-body)", textDecoration: "none" }}>Driver</Link>
            <Link to="/operator" style={{ color: "var(--text-body)", textDecoration: "none" }}>Operator</Link>
            <Link to="/login" style={{ color: "var(--text-body)", textDecoration: "none" }}>Sign In</Link>
          </div>

          <div className="beacon-live">
            <span className="beacon-dot"></span>
            <span>All Systems Operational (99.9%)</span>
          </div>
        </div>

        <div
          style={{
            maxWidth: "1280px",
            margin: "24px auto 0 auto",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "var(--text-subtle)",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>&copy; {new Date().getFullYear()} TransitIQ Technologies. Hyderabad Transit Network.</div>
          <div>Secured with JWT & Real-time WebSocket Telemetry</div>
        </div>
      </footer>
    </div>
  );
}

export default Home;