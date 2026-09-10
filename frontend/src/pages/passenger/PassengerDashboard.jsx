import {
  BusFront,
  Clock3,
  MapPin,
  Navigation,
  Search,
  Star,
  Ticket,
  Radio,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import TransitMap from "../../components/TransitMap";

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
  const [wsConnected, setWsConnected] = useState(false);

  // Load user name
  const userData = localStorage.getItem("transitiq_user");
  const user = userData ? JSON.parse(userData) : { name: "Deekshitha" };

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

    // Fallback polling
    const poll = () => {
      fetch(`${API_BASE}/tracking/live-locations`)
        .then((r) => r.json())
        .then(setLiveBuses)
        .catch(console.error);
    };
    poll();
    const interval = setInterval(poll, 6000);

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

  const routeLine = stops.map((s) => [s.latitude, s.longitude]);
  const relevantBuses = liveBuses.filter((b) => !b.route_id || b.route_id === selectedRouteId);

  const calculateETA = (stopLat, stopLng) => {
    if (relevantBuses.length === 0) return null;
    const bus = relevantBuses[0];
    if (!bus.latitude || !bus.longitude) return null;
    const dist = getDistanceKm(bus.latitude, bus.longitude, stopLat, stopLng);
    const speed = bus.speed && bus.speed > 10 ? bus.speed : 25;
    const mins = Math.round((dist / speed) * 60);
    if (dist < 0.2) return "Arriving now";
    if (mins < 1) return "1 min";
    return `${mins} mins (${dist.toFixed(1)} km)`;
  };

  return (
    <div className="passenger-dashboard">
      {/* Navbar */}
      <header className="dashboard-navbar">
        <a href="/" className="dashboard-brand">
          <div className="dashboard-brand-icon">
            <BusFront size={19} />
          </div>
          TransitIQ
        </a>

        <nav className="dashboard-nav-links">
          <a href="/passenger" className="active">
            Dashboard
          </a>
          <a href="/driver">Driver Portal</a>
          <a href="/operator">Operator Console</a>
        </nav>

        <div className="dashboard-profile">
          <div className="profile-avatar">
            {user.name ? user.name.slice(0, 2).toUpperCase() : "DS"}
          </div>
          <div>
            <strong>{user.name || "Deekshitha"}</strong>
            <span>Passenger</span>
          </div>
        </div>
      </header>

      <main className="dashboard-main" style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px" }}>
        {/* Welcome */}
        <section className="dashboard-welcome" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <span className="dashboard-eyebrow" style={{ color: "#2563eb", fontWeight: 600, fontSize: "12px", letterSpacing: "0.05em" }}>
              PASSENGER DASHBOARD
            </span>
            <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "4px 0" }}>
              Live Hyderabad Transit Map
            </h1>
            <p style={{ color: "#64748b" }}>
              Track real-time bus locations, corridors, and dynamic arrival ETAs.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f1f5f9", padding: "8px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: 500 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: wsConnected ? "#10b981" : "#f59e0b" }} />
            <span>{wsConnected ? "Live Telemetry Connected" : "Polling Active"}</span>
          </div>
        </section>

        {/* Real-time Map & Route Control Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px", marginBottom: "32px" }}>
          {/* Corridor Selection & Stops Sidebar */}
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Select Transit Corridor
            </label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(Number(e.target.value))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: 600, color: "#1e293b", marginBottom: "16px", outline: "none" }}
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  Route {r.route_code}: {r.name}
                </option>
              ))}
            </select>

            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
              {routeDetail?.description}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>
                ROUTE ITINERARY ({stops.length} STATIONS)
              </span>
              <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: 600 }}>
                {relevantBuses.length} Bus Online
              </span>
            </div>

            {/* Stops list with dynamic ETA */}
            <div style={{ maxHeight: "380px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
              {stops.map((stop, idx) => {
                const eta = calculateETA(stop.latitude, stop.longitude);
                return (
                  <div
                    key={stop.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: "#f8fafc",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#e0f2fe", color: "#0284c7", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {idx + 1}
                      </span>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{stop.name}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{idx === 0 ? "Terminal" : idx === stops.length - 1 ? "Terminus" : "Station"}</div>
                      </div>
                    </div>

                    {eta && (
                      <span style={{ fontSize: "11px", fontWeight: 600, color: eta.includes("now") ? "#16a34a" : "#2563eb", background: "white", padding: "3px 8px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                        {eta}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Map */}
          <div style={{ background: "white", borderRadius: "16px", padding: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                {routeDetail ? `Corridor Map: ${routeDetail.name}` : "Transit Map"}
              </div>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Live OpenStreetMap Tracking</span>
            </div>
            <div style={{ flex: 1, minHeight: "460px" }}>
              <TransitMap stops={stops} buses={relevantBuses} routeLine={routeLine} height="100%" />
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <section className="dashboard-section" style={{ marginTop: "24px" }}>
          <div className="dashboard-section-heading">
            <div>
              <span style={{ color: "#2563eb", fontSize: "12px", fontWeight: 600 }}>QUICK ACCESS</span>
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "4px 0" }}>Transit Actions</h2>
            </div>
          </div>

          <div className="quick-action-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "12px" }}>
            <a href="/driver" className="quick-action-card" style={{ display: "flex", gap: "14px", padding: "16px", borderRadius: "12px", background: "white", border: "1px solid #e2e8f0", textDecoration: "none", color: "inherit" }}>
              <div style={{ width: 44, height: 44, borderRadius: "10px", background: "#f3e8ff", color: "#7e22ce", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Navigation size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Driver Portal</h3>
                <p style={{ fontSize: "12px", color: "#64748b" }}>Start live route run & GPS simulation.</p>
              </div>
            </a>

            <a href="/operator" className="quick-action-card" style={{ display: "flex", gap: "14px", padding: "16px", borderRadius: "12px", background: "white", border: "1px solid #e2e8f0", textDecoration: "none", color: "inherit" }}>
              <div style={{ width: 44, height: 44, borderRadius: "10px", background: "#dcfce7", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ticket size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Operator Radar</h3>
                <p style={{ fontSize: "12px", color: "#64748b" }}>Fleet oversight & incident triage.</p>
              </div>
            </a>

            <div className="quick-action-card" style={{ display: "flex", gap: "14px", padding: "16px", borderRadius: "12px", background: "white", border: "1px solid #e2e8f0" }}>
              <div style={{ width: 44, height: 44, borderRadius: "10px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Hyderabad Network</h3>
                <p style={{ fontSize: "12px", color: "#64748b" }}>13 terminals, 2 active corridors.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default PassengerDashboard;