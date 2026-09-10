import {
  BusFront,
  Clock3,
  MapPin,
  Navigation,
  Search,
  Star,
  Ticket,
  Radio,
  ArrowRight,
  Shield,
  LogOut,
  Sparkles,
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
        localStorage.setItem("transitiq_user", JSON.stringify({ name: "Mohammad Ali", role: "driver", email: "driver@test.com" }));
      } else if (targetRole === "operator") {
        localStorage.setItem("transitiq_token", "demo_op");
        localStorage.setItem("transitiq_user", JSON.stringify({ name: "Rajesh Kumar", role: "operator", email: "operator@test.com" }));
      } else {
        localStorage.setItem("transitiq_token", "demo_passenger");
        localStorage.setItem("transitiq_user", JSON.stringify({ name: "Passenger", role: "passenger", email: "passenger@test.com" }));
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
      } catch (err) {
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
  const relevantBuses = liveBuses.filter((b) => !b.route_id || b.route_id === selectedRouteId);
  const activeBus = relevantBuses[0] || null;

  const calculateETA = (stopLat, stopLng) => {
    if (!activeBus || !activeBus.latitude || !activeBus.longitude) return null;
    const dist = getDistanceKm(activeBus.latitude, activeBus.longitude, stopLat, stopLng);
    const speed = activeBus.speed && activeBus.speed > 10 ? activeBus.speed : 25;
    const mins = Math.round((dist / speed) * 60);
    if (dist < 0.25) return "Arriving now";
    if (mins < 1) return "1 min away";
    return `${mins} mins (${dist.toFixed(1)} km)`;
  };

  return (
    <div className="tiq-dashboard-container">
      {/* Top Professional Navigation */}
      <header className="tiq-top-nav">
        <Link to="/" className="tiq-brand-badge">
          <div className="tiq-brand-icon-box">
            <BusFront size={20} />
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Transit<span style={{ color: "var(--primary-color)" }}>IQ</span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
              HYDERABAD METROPOLITAN
            </div>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="tiq-nav-pill-group">
          <button
            onClick={() => switchToPortal("passenger", "/passenger")}
            className="tiq-nav-pill active"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <Navigation size={15} /> Passenger Hub
          </button>
          <button
            onClick={() => switchToPortal("driver", "/driver")}
            className="tiq-nav-pill"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <Radio size={15} /> Driver Cockpit
          </button>
          <button
            onClick={() => switchToPortal("operator", "/operator")}
            className="tiq-nav-pill"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <Shield size={15} /> Operator Radar
          </button>
        </nav>

        {/* Status & User */}
        <div className="tiq-user-status-card">
          <div className="tiq-live-beacon">
            <span className="tiq-beacon-dot"></span>
            {wsConnected ? "Telemetry Active" : "Polling Active"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "12px", borderLeft: "1px solid var(--surface-border)" }}>
            <div className="tiq-avatar">
              {user.name ? user.name.slice(0, 2).toUpperCase() : "PA"}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>{user.name || "Passenger"}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Hyderabad Commuter</div>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: "transparent", border: "none", color: "var(--text-subtle)", padding: "4px", cursor: "pointer", marginLeft: "6px" }}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main style={{ maxWidth: "1380px", width: "100%", margin: "0 auto", padding: "28px 32px", flex: 1 }}>
        {/* KPI Quick Banner */}
        <div className="tiq-kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="tiq-kpi-card">
            <div className="tiq-kpi-header">
              <span className="tiq-kpi-title">SELECTED CORRIDOR</span>
              <div className="tiq-kpi-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                <Ticket size={18} />
              </div>
            </div>
            <div className="tiq-kpi-value" style={{ fontSize: "24px" }}>
              {routeDetail ? `Route ${routeDetail.route_code}` : "Route Corridor"}
            </div>
            <div className="tiq-kpi-subtitle">
              {routeDetail?.name || "Loading trunk corridor..."}
            </div>
          </div>

          <div className="tiq-kpi-card">
            <div className="tiq-kpi-header">
              <span className="tiq-kpi-title">LIVE VEHICLES ONLINE</span>
              <div className="tiq-kpi-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
                <BusFront size={18} />
              </div>
            </div>
            <div className="tiq-kpi-value" style={{ fontSize: "24px", color: "#059669" }}>
              {relevantBuses.length} Active Bus{relevantBuses.length === 1 ? "" : "es"}
            </div>
            <div className="tiq-kpi-subtitle">
              Broadcasting GPS coordinates every 1.5s
            </div>
          </div>

          <div className="tiq-kpi-card">
            <div className="tiq-kpi-header">
              <span className="tiq-kpi-title">NETWORK DISPATCH</span>
              <div className="tiq-kpi-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                <Clock3 size={18} />
              </div>
            </div>
            <div className="tiq-kpi-value" style={{ fontSize: "24px", color: "#0f172a" }}>
              Regular Frequency
            </div>
            <div className="tiq-kpi-subtitle">
              Estimated 8-10 min headway between buses
            </div>
          </div>
        </div>

        {/* Map & Itinerary Content */}
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "24px" }}>
          {/* Station Itinerary Sidebar */}
          <div className="tiq-panel" style={{ display: "flex", flexDirection: "column", maxHeight: "720px" }}>
            <div className="tiq-panel-header">
              <div>
                <div className="tiq-panel-title">Transit Corridor</div>
                <div className="tiq-panel-subtitle">Select route and track stops</div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 700, background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px" }}>
                {stops.length} Stations
              </span>
            </div>

            {/* Corridor Select */}
            <div style={{ marginBottom: "16px" }}>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--surface-border)",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--text-main)",
                  outline: "none",
                  background: "var(--surface-ground)",
                  cursor: "pointer",
                }}
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    Route {r.route_code}: {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Station Filter Search */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <Search size={16} color="var(--text-subtle)" style={{ position: "absolute", left: 12, top: 12 }} />
              <input
                type="text"
                placeholder="Filter stations along route..."
                value={searchStop}
                onChange={(e) => setSearchStop(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: "10px",
                  border: "1px solid var(--surface-border)",
                  fontSize: "13px",
                  outline: "none",
                  background: "white",
                }}
              />
            </div>

            {/* Stops Timeline */}
            <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
              <div className="tiq-timeline-list">
                {filteredStops.map((stop, idx) => {
                  const eta = calculateETA(stop.latitude, stop.longitude);
                  const isTerminal = idx === 0 || idx === filteredStops.length - 1;
                  return (
                    <div key={stop.id} className="tiq-timeline-item">
                      <div className={`tiq-timeline-hub ${eta?.includes("now") ? "active" : ""}`}>
                        {stop.sequence !== undefined ? stop.sequence + 1 : idx + 1}
                      </div>
                      <div className="tiq-timeline-body">
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)" }}>
                            {stop.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                            {idx === 0 ? "Origin Terminal" : idx === filteredStops.length - 1 ? "Destination Terminal" : "Transit Station"}
                          </div>
                        </div>

                        {eta && (
                          <div style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: "12px",
                            background: eta.includes("now") ? "#dcfce7" : "#eff6ff",
                            color: eta.includes("now") ? "#15803d" : "#1d4ed8",
                            border: `1px solid ${eta.includes("now") ? "#bbf7d0" : "#dbeafe"}`,
                            whiteSpace: "nowrap"
                          }}>
                            {eta}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Map and Live Vehicle Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="tiq-panel" style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column" }}>
              <div className="tiq-panel-header">
                <div>
                  <div className="tiq-panel-title">
                    {routeDetail ? `Corridor Radar: ${routeDetail.name}` : "Live Map"}
                  </div>
                  <div className="tiq-panel-subtitle">
                    Real-time high frequency vehicle telemetry and route geometries
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#1d4ed8", background: "#eff6ff", padding: "6px 12px", borderRadius: "8px", border: "1px solid #dbeafe" }}>
                    Corridor {routeDetail?.route_code || "5K"}
                  </span>
                </div>
              </div>

              <div style={{ flex: 1, minHeight: "500px" }}>
                <TransitMap stops={stops} buses={relevantBuses} routeLine={routeLine} height="100%" />
              </div>
            </div>

            {/* Active Bus Fleet Details Card */}
            {activeBus && (
              <div className="tiq-panel" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "12px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BusFront size={26} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px", fontWeight: 800 }}>{activeBus.license_plate}</span>
                        <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", background: "#ecfdf5", color: "#059669" }}>
                          LIVE IN TRANSIT
                        </span>
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Model: Volvo 8400 Low-Floor AC • Assigned to Route {routeDetail?.route_code}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "28px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>CURRENT SPEED</div>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "#2563eb" }}>
                        {activeBus.speed ? `${Math.round(activeBus.speed)} km/h` : "Stationary"}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>SERVICE HEADWAY</div>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "#059669" }}>
                        On Schedule
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>OPERATOR</div>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-main)" }}>
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