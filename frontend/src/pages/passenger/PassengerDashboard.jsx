import {
  BusFront,
  Clock3,
  MapPin,
  Navigation,
  Search,
  Ticket,
  Radio,
  Shield,
  LogOut,
  Sparkles,
  Zap,
  Gauge,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import TransitMap from "../../components/TransitMap";
import "../../dashboard.css";

const API_BASE = "http://localhost:5000/api";

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function PassengerDashboard() {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(1);
  const [routeDetail, setRouteDetail] = useState(null);
  const [liveBuses, setLiveBuses] = useState([]);
  const [searchStop, setSearchStop] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const navigate = useNavigate();

  // Load user profile
  const userData = localStorage.getItem("transitiq_user");
  const user = userData ? JSON.parse(userData) : { name: "Deekshitha" };

  const handleLogout = () => {
    localStorage.removeItem("transitiq_token");
    localStorage.removeItem("transitiq_user");
    navigate("/login");
  };

  const switchToPortal = (targetRole, path) => {
    if (user.role !== targetRole) {
      if (targetRole === "driver") {
        localStorage.setItem("transitiq_token", "demo_driver");
        localStorage.setItem(
          "transitiq_user",
          JSON.stringify({
            name: "Mohammad Ali",
            role: "driver",
            email: "driver@test.com",
          })
        );
      } else if (targetRole === "operator") {
        localStorage.setItem("transitiq_token", "demo_op");
        localStorage.setItem(
          "transitiq_user",
          JSON.stringify({
            name: "Rajesh Kumar",
            role: "operator",
            email: "operator@test.com",
          })
        );
      } else {
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
    }
    navigate(path);
  };

  // Fetch routes
  useEffect(() => {
    fetch(`${API_BASE}/routes`)
      .then((r) => r.json())
      .then((data) => {
        setRoutes(data);
        if (data.length > 0) setSelectedRouteId(data[0].id);
      })
      .catch(console.error);
  }, []);

  // Fetch route details
  useEffect(() => {
    if (!selectedRouteId) return;
    fetch(`${API_BASE}/routes/${selectedRouteId}`)
      .then((r) => r.json())
      .then(setRouteDetail)
      .catch(console.error);
  }, [selectedRouteId]);

  // Connect to Live Tracking WebSocket
  useEffect(() => {
    let ws;
    const connectWS = () => {
      try {
        ws = new WebSocket("ws://localhost:5000/ws/passenger");
        ws.onopen = () => setWsConnected(true);
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setLiveBuses((prev) => {
            const idx = prev.findIndex((b) => b.bus_id === data.bus_id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], ...data };
              return copy;
            }
            return [...prev, data];
          });
        };
        ws.onclose = () => {
          setWsConnected(false);
          setTimeout(connectWS, 4000);
        };
      } catch {
        setWsConnected(false);
      }
    };
    connectWS();

    const poll = () => {
      fetch(`${API_BASE}/tracking/live-locations`)
        .then((r) => r.json())
        .then(setLiveBuses)
        .catch(console.error);
    };
    poll();
    const interval = setInterval(poll, 5000);

    return () => {
      if (ws) ws.close();
      clearInterval(interval);
    };
  }, []);

  const stops = (routeDetail?.stop_associations || []).map((a) => ({
    id: a.stop.id,
    name: a.stop.name,
    latitude: a.stop.latitude,
    longitude: a.stop.longitude,
    sequence: a.sequence,
  }));

  const filteredStops = stops.filter((s) =>
    s.name.toLowerCase().includes(searchStop.toLowerCase())
  );

  const routeLine = stops.map((s) => [s.latitude, s.longitude]);
  const relevantBuses = liveBuses.filter(
    (b) => !b.route_id || b.route_id === selectedRouteId
  );
  const activeBus = relevantBuses[0] || null;

  const calculateETA = (stopLat, stopLng) => {
    if (!activeBus || !activeBus.latitude || !activeBus.longitude) return null;
    const dist = getDistanceKm(
      activeBus.latitude,
      activeBus.longitude,
      stopLat,
      stopLng
    );
    const speed = activeBus.speed && activeBus.speed > 10 ? activeBus.speed : 25;
    const mins = Math.round((dist / speed) * 60);
    if (dist < 0.25) return "Arriving now";
    if (mins < 1) return "1 min away";
    return `${mins} mins (${dist.toFixed(1)} km)`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        backgroundImage:
          "radial-gradient(circle at 12% 15%, rgba(99, 102, 241, 0.08) 0%, transparent 40%), radial-gradient(circle at 88% 85%, rgba(6, 182, 212, 0.08) 0%, transparent 40%)",
        color: "var(--text-heading)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Navigation Bar */}
      <header className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <div className="brand-icon">
              <BusFront size={20} />
            </div>
            <span>TransitIQ</span>
          </Link>

          {/* Nav Pills */}
          <nav className="navbar-links">
            <button
              onClick={() => switchToPortal("passenger", "/passenger")}
              className="active"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Navigation size={14} /> Passenger Hub
            </button>
            <button
              onClick={() => switchToPortal("driver", "/driver")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-body)",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 600,
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Radio size={14} /> Driver Cockpit
            </button>
            <button
              onClick={() => switchToPortal("operator", "/operator")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-body)",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 600,
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Shield size={14} /> Operator Radar
            </button>
          </nav>

          {/* Status & User */}
          <div className="navbar-actions">
            <div className="beacon-live">
              <span className="beacon-dot"></span>
              <span>{wsConnected ? "Telemetry Live" : "Polling Active"}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px",
                  background: "rgba(99, 102, 241, 0.15)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  {user.name ? user.name[0].toUpperCase() : "P"}
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                  {user.name || "Passenger"}
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-muted)",
                  padding: "8px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container - Aligned exactly like Home page */}
      <main
        style={{
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px",
          flex: 1,
        }}
      >
        {/* Header Title Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#38bdf8",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              REAL-TIME PASSENGER TELEMETRY
            </span>
            <h1
              style={{
                fontSize: "30px",
                fontWeight: 800,
                color: "#ffffff",
                marginTop: "4px",
              }}
            >
              Hyderabad Transit Radar
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-body)", marginTop: "4px" }}>
              Select a transit corridor below to inspect real-time bus locations and station ETAs.
            </p>
          </div>

          {/* Corridor Quick Tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              background: "rgba(10, 16, 28, 0.8)",
              padding: "5px",
              borderRadius: "12px",
              border: "1px solid var(--border-glass)",
            }}
          >
            {routes.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRouteId(r.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border:
                    selectedRouteId === r.id
                      ? "1px solid rgba(99, 102, 241, 0.5)"
                      : "1px solid transparent",
                  background:
                    selectedRouteId === r.id
                      ? "linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(6, 182, 212, 0.25))"
                      : "transparent",
                  color: selectedRouteId === r.id ? "#ffffff" : "var(--text-body)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: selectedRouteId === r.id ? "#38bdf8" : "var(--text-muted)",
                  }}
                >
                  Line {r.route_code}
                </span>
                <span>{r.name.includes("Charminar") ? "Charminar" : "Gachibowli"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3 KPI Cards - Neatly styled like Home Page */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "28px",
          }}
        >
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                ACTIVE CORRIDOR
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(99, 102, 241, 0.15)",
                  color: "#818cf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ticket size={16} />
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "22px",
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              Route {routeDetail?.route_code || "5K"}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-body)", marginTop: "4px" }}>
              {routeDetail?.name || "Loading trunk corridor..."}
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                LIVE FLEET ON CORRIDOR
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BusFront size={16} />
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "22px",
                fontWeight: 800,
                color: "#34d399",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span className="beacon-dot"></span>
              {relevantBuses.length} Active Bus{relevantBuses.length === 1 ? "" : "es"}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-body)", marginTop: "4px" }}>
              Sub-second vehicle telemetry active
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                DISPATCH FREQUENCY
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Clock3 size={16} />
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "22px",
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              Every 8–10 mins
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-body)", marginTop: "4px" }}>
              High-frequency metropolitan dispatch
            </div>
          </div>
        </div>

        {/* Main Workspace: 360px Sidebar + Map & Telemetry HUD */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "360px 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Left Column: Station Itinerary */}
          <div
            className="glass-panel"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff" }}>
                  Station Itinerary
                </h3>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Stops sequence & arrival estimates
                </div>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  background: "rgba(99, 102, 241, 0.15)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  color: "#a5b4fc",
                  padding: "4px 10px",
                  borderRadius: "8px",
                }}
              >
                {stops.length} Stations
              </span>
            </div>

            {/* Station Filter Search */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <Search
                size={15}
                color="var(--text-muted)"
                style={{ position: "absolute", left: 12, top: 12 }}
              />
              <input
                type="text"
                placeholder="Filter stations..."
                value={searchStop}
                onChange={(e) => setSearchStop(e.target.value)}
                className="input-glass"
                style={{
                  paddingLeft: "36px",
                  paddingTop: "9px",
                  paddingBottom: "9px",
                  fontSize: "13px",
                }}
              />
            </div>

            {/* Scrollable Timeline */}
            <div
              style={{
                maxHeight: "520px",
                overflowY: "auto",
                paddingRight: "6px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {filteredStops.map((stop, idx) => {
                const eta = calculateETA(stop.latitude, stop.longitude);
                const isTerminal = idx === 0 || idx === filteredStops.length - 1;
                return (
                  <div
                    key={stop.id}
                    style={{
                      background: "rgba(10, 16, 28, 0.6)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "12px",
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: eta?.includes("now")
                            ? "linear-gradient(135deg, #10b981, #059669)"
                            : "rgba(99, 102, 241, 0.2)",
                          border: eta?.includes("now")
                            ? "2px solid #34d399"
                            : "1px solid rgba(99, 102, 241, 0.4)",
                          color: eta?.includes("now") ? "white" : "#a5b4fc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 800,
                          flexShrink: 0,
                          boxShadow: eta?.includes("now")
                            ? "0 0 10px rgba(16, 185, 129, 0.5)"
                            : "none",
                        }}
                      >
                        {stop.sequence !== undefined ? stop.sequence + 1 : idx + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                          {stop.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {idx === 0
                            ? "Origin Terminal"
                            : idx === filteredStops.length - 1
                            ? "Destination Terminal"
                            : "Transit Station"}
                        </div>
                      </div>
                    </div>

                    {eta && (
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "8px",
                          background: eta.includes("now")
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(99, 102, 241, 0.15)",
                          color: eta.includes("now") ? "#34d399" : "#a5b4fc",
                          border: `1px solid ${
                            eta.includes("now")
                              ? "rgba(16, 185, 129, 0.3)"
                              : "rgba(99, 102, 241, 0.3)"
                          }`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {eta}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Map & Vehicle HUD */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Map Card */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      color: "#38bdf8",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    LIVE NETWORK RADAR
                  </span>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>
                    {routeDetail ? routeDetail.name : "Corridor View"}
                  </h3>
                </div>

                <div className="beacon-live">
                  <span className="beacon-dot"></span>
                  <span>Live Telemetry Grid</span>
                </div>
              </div>

              {/* Clean Map without watermark */}
              <div
                style={{
                  height: "460px",
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: "1px solid var(--border-glass)",
                }}
              >
                <TransitMap
                  stops={stops}
                  buses={relevantBuses}
                  routeLine={routeLine}
                  height="100%"
                />
              </div>
            </div>

            {/* Active Bus Fleet Details HUD */}
            {activeBus && (
              <div className="glass-panel" style={{ padding: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 0 16px rgba(99, 102, 241, 0.4)",
                      }}
                    >
                      <BusFront size={22} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: 800,
                            fontFamily: "var(--font-mono)",
                            color: "#ffffff",
                          }}
                        >
                          {activeBus.license_plate}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: "rgba(16, 185, 129, 0.15)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            color: "#34d399",
                          }}
                        >
                          LIVE IN TRANSIT
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          marginTop: "2px",
                        }}
                      >
                        Volvo 8400 AC Low-Floor • Assigned to Line {routeDetail?.route_code}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "28px" }}>
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--text-muted)",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                        }}
                      >
                        CURRENT SPEED
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: 800,
                          color: "#38bdf8",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {activeBus.speed ? `${Math.round(activeBus.speed)} km/h` : "Stationary"}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--text-muted)",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                        }}
                      >
                        SERVICE HEADWAY
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: 800,
                          color: "#34d399",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        On Schedule
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--text-muted)",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                        }}
                      >
                        OPERATOR
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: 800,
                          color: "#ffffff",
                        }}
                      >
                        TSRTC Urban
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PassengerDashboard;