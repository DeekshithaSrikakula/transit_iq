import { ArrowRight, MapPin, Navigation, Search, BusFront, Shield, Radio } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navigation/Navbar";
import SearchBox from "../../components/home/SearchBox";
import TransitMap from "../../components/TransitMap";

const API_BASE = "http://localhost:5000/api";

function Home() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch live buses and stops for home radar
    Promise.all([
      fetch(`${API_BASE}/tracking/live-locations`).then((r) => r.json()),
      fetch(`${API_BASE}/routes/1`).then((r) => r.json()),
      fetch(`${API_BASE}/stops`).then((r) => r.json()),
    ])
      .then(([busData, routeData, stopsData]) => {
        if (Array.isArray(busData)) setBuses(busData);
        if (routeData && routeData.stop_associations) {
          setStops(routeData.stop_associations.map((a) => a.stop));
        } else if (Array.isArray(stopsData)) {
          setStops(stopsData);
        }
      })
      .catch(console.error);
  }, []);

  const routeLine = stops.map((s) => [s.latitude, s.longitude]);

  const handleOpenPassenger = () => {
    if (!localStorage.getItem("transitiq_token")) {
      localStorage.setItem("transitiq_token", "demo_token");
      localStorage.setItem(
        "transitiq_user",
        JSON.stringify({ name: "Passenger", role: "passenger", email: "passenger@test.com" })
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
    <div className="app">
      <Navbar />

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="status-dot"></span>
              Live transit for Hyderabad
            </div>

            <h1>
              Move smarter.
              <br />
              <span>Travel better.</span>
            </h1>

            <p className="hero-description">
              Find nearby buses, discover the best routes, and track your
              journey in real time with TransitIQ.
            </p>

            <div className="hero-actions">
              <button onClick={handleScrollToPlanner} className="primary-button" style={{ cursor: "pointer" }}>
                Plan your journey
                <ArrowRight size={18} />
              </button>

              <button onClick={handleOpenPassenger} className="secondary-button" style={{ cursor: "pointer" }}>
                <Navigation size={18} />
                Explore live buses
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="map-card" style={{ padding: "16px" }}>
              <div className="map-header">
                <div>
                  <span className="map-label">LIVE NETWORK RADAR</span>
                  <h3>Hyderabad Transit</h3>
                </div>

                <div className="live-indicator">
                  <span></span>
                  Live Telemetry
                </div>
              </div>

              {/* Real Interactive Map instead of dummy CSS boxes */}
              <div style={{ height: "240px", borderRadius: "10px", overflow: "hidden", margin: "12px 0" }}>
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
                  <span>Active buses</span>
                </div>

                <div>
                  <strong>2</strong>
                  <span>Corridors</span>
                </div>

                <div>
                  <strong>13</strong>
                  <span>Stations</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SearchBox />

        {/* Portals Quick Selector Banner */}
        <section style={{ maxWidth: "1200px", margin: "0 auto 40px auto", padding: "0 24px" }}>
          <div style={{ background: "white", padding: "20px 24px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                Looking for Driver or Operator Portals?
              </h3>
              <p style={{ fontSize: "13px", color: "#64748b" }}>
                Access live dispatch telemetry and fleet radar directly.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  localStorage.setItem("transitiq_token", "demo_driver");
                  localStorage.setItem("transitiq_user", JSON.stringify({ name: "Mohammad Ali", role: "driver", email: "driver@test.com" }));
                  navigate("/driver");
                }}
                style={{ padding: "8px 16px", borderRadius: "8px", background: "#f3e8ff", color: "#7e22ce", border: "1px solid #e9d5ff", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Radio size={15} /> Driver Cockpit
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("transitiq_token", "demo_op");
                  localStorage.setItem("transitiq_user", JSON.stringify({ name: "Rajesh Kumar", role: "operator", email: "operator@test.com" }));
                  navigate("/operator");
                }}
                style={{ padding: "8px 16px", borderRadius: "8px", background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Shield size={15} /> Operator Radar
              </button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="features-section">
          <section className="how-it-works">
            <div className="section-heading">
              <span>HOW TRANSITIQ WORKS</span>
              <h2>Your journey, made simple.</h2>
            </div>

            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">01</div>
                <h3>Search</h3>
                <p>Enter your origin and destination station in Hyderabad.</p>
              </div>

              <div className="step-card">
                <div className="step-number">02</div>
                <h3>Choose a route</h3>
                <p>Compare available transit lines and scheduled stops.</p>
              </div>

              <div className="step-card">
                <div className="step-number">03</div>
                <h3>Track your bus</h3>
                <p>Watch live bus positions and dynamic arrival ETAs.</p>
              </div>

              <div className="step-card">
                <div className="step-number">04</div>
                <h3>Reach your destination</h3>
                <p>Travel predictably with real-time transit telemetry.</p>
              </div>
            </div>
          </section>

          <div className="section-heading">
            <span>WHY TRANSITIQ</span>
            <h2>Everything you need for a better journey.</h2>
          </div>

          <div className="feature-grid">
            <div className="feature-card" onClick={handleOpenPassenger} style={{ cursor: "pointer" }}>
              <div className="feature-icon">
                <Navigation size={22} />
              </div>
              <h3>Live Bus Tracking</h3>
              <p>See buses moving in real time on OpenStreetMap.</p>
            </div>

            <div className="feature-card" onClick={handleScrollToPlanner} style={{ cursor: "pointer" }}>
              <div className="feature-icon">
                <Search size={22} />
              </div>
              <h3>Smart Route Search</h3>
              <p>Find convenient corridors between your start and destination.</p>
            </div>

            <div className="feature-card" onClick={handleOpenPassenger} style={{ cursor: "pointer" }}>
              <div className="feature-icon">
                <MapPin size={22} />
              </div>
              <h3>Accurate ETA</h3>
              <p>Dynamic arrival calculations based on live GPS distances.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;