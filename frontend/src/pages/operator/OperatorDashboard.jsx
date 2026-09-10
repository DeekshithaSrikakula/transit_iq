import {
  AlertTriangle,
  BusFront,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  Shield,
  Users,
  Route as RouteIcon,
  Navigation,
  Radio,
  LogOut,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import TransitMap from "../../components/TransitMap";
import "../../dashboard.css";

const API_BASE = "http://localhost:5000/api";

function OperatorDashboard() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [liveLocations, setLiveLocations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const navigate = useNavigate();

  // Load user
  const userData = localStorage.getItem("transitiq_user");
  const user = userData ? JSON.parse(userData) : { name: "Rajesh Kumar" };

  const handleLogout = () => {
    localStorage.removeItem("transitiq_token");
    localStorage.removeItem("transitiq_user");
    navigate("/login");
  };

  const switchToPortal = (targetRole, path) => {
    if (user.role !== targetRole) {
      if (targetRole === "passenger") {
        localStorage.setItem("transitiq_token", "demo_passenger");
        localStorage.setItem("transitiq_user", JSON.stringify({ name: "Passenger", role: "passenger", email: "passenger@test.com" }));
      } else if (targetRole === "driver") {
        localStorage.setItem("transitiq_token", "demo_driver");
        localStorage.setItem("transitiq_user", JSON.stringify({ name: "Mohammad Ali", role: "driver", email: "driver@test.com" }));
      } else {
        localStorage.setItem("transitiq_token", "demo_op");
        localStorage.setItem("transitiq_user", JSON.stringify({ name: "Rajesh Kumar", role: "operator", email: "operator@test.com" }));
      }
    }
    navigate(path);
  };

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [bRes, rRes, sRes, scRes, iRes, lRes] = await Promise.all([
        fetch(`${API_BASE}/buses`),
        fetch(`${API_BASE}/routes`),
        fetch(`${API_BASE}/stops`),
        fetch(`${API_BASE}/schedules`),
        fetch(`${API_BASE}/incidents`),
        fetch(`${API_BASE}/tracking/live-locations`),
      ]);

      if (bRes.ok) setBuses(await bRes.json());
      if (rRes.ok) setRoutes(await rRes.json());
      if (sRes.ok) setStops(await sRes.json());
      if (scRes.ok) setSchedules(await scRes.json());
      if (iRes.ok) setIncidents(await iRes.json());
      if (lRes.ok) setLiveLocations(await lRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const resolveIncident = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      if (res.ok) {
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === id ? { ...inc, status: "resolved" } : inc))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeBusesCount = buses.filter((b) => b.status === "active").length;
  const pendingIncidents = incidents.filter((i) => i.status === "reported");

  const mapStops = stops.map((s) => ({
    id: s.id,
    name: s.name,
    latitude: s.latitude,
    longitude: s.longitude,
  }));

  const mapBuses = liveLocations.map((loc) => ({
    bus_id: loc.bus_id,
    license_plate: loc.license_plate || `Bus ${loc.bus_id}`,
    latitude: loc.latitude,
    longitude: loc.longitude,
    speed: loc.speed || 0,
    status: loc.status || "active",
  }));

  return (
    <div className="tiq-dashboard-container">
      {/* Top Enterprise Command Nav */}
      <header className="tiq-top-nav">
        <Link to="/" className="tiq-brand-badge">
          <div className="tiq-brand-icon-box" style={{ background: "linear-gradient(135deg, #059669, #047857)" }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Transit<span style={{ color: "#059669" }}>IQ</span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
              CENTRAL DISPATCH & RADAR
            </div>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="tiq-nav-pill-group">
          <button
            onClick={() => switchToPortal("passenger", "/passenger")}
            className="tiq-nav-pill"
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
            className="tiq-nav-pill active"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <Shield size={15} /> Operator Radar
          </button>
        </nav>

        {/* Time & Controller Info */}
        <div className="tiq-user-status-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(10, 16, 28, 0.7)", padding: "6px 14px", borderRadius: "10px", border: "1px solid var(--border-glass)", fontSize: "12px", fontWeight: 700, color: "#ffffff", fontFamily: "var(--font-mono)" }}>
            <Clock3 size={14} color="#06b6d4" /> {currentTime} IST
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "12px", borderLeft: "1px solid var(--surface-border)" }}>
            <div className="tiq-avatar" style={{ background: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0" }}>
              {user.name ? user.name.slice(0, 2).toUpperCase() : "OP"}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>{user.name || "Rajesh Kumar"}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Chief Dispatcher</div>
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
        {/* KPI Metrics Banner */}
        <div className="tiq-kpi-grid">
          <div className="tiq-kpi-card">
            <div className="tiq-kpi-header">
              <span className="tiq-kpi-title">ACTIVE FLEET COVERAGE</span>
              <div className="tiq-kpi-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
                <BusFront size={18} />
              </div>
            </div>
            <div className="tiq-kpi-value" style={{ color: "#059669" }}>
              {activeBusesCount} <span style={{ fontSize: "16px", color: "var(--text-subtle)", fontWeight: 600 }}>/ {buses.length}</span>
            </div>
            <div className="tiq-kpi-subtitle">
              100% active transit availability
            </div>
          </div>

          <div className="tiq-kpi-card">
            <div className="tiq-kpi-header">
              <span className="tiq-kpi-title">TRANSIT CORRIDORS</span>
              <div className="tiq-kpi-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                <RouteIcon size={18} />
              </div>
            </div>
            <div className="tiq-kpi-value" style={{ color: "#2563eb" }}>
              {routes.length} <span style={{ fontSize: "16px", color: "var(--text-subtle)", fontWeight: 600 }}>Lines</span>
            </div>
            <div className="tiq-kpi-subtitle">
              Core North-South & IT Corridors
            </div>
          </div>

          <div className="tiq-kpi-card">
            <div className="tiq-kpi-header">
              <span className="tiq-kpi-title">MONITORED STATIONS</span>
              <div className="tiq-kpi-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                <MapPin size={18} />
              </div>
            </div>
            <div className="tiq-kpi-value" style={{ color: "#0f172a" }}>
              {stops.length} <span style={{ fontSize: "16px", color: "var(--text-subtle)", fontWeight: 600 }}>Terminals</span>
            </div>
            <div className="tiq-kpi-subtitle">
              Hyderabad Metropolitan Network
            </div>
          </div>

          <div className="tiq-kpi-card">
            <div className="tiq-kpi-header">
              <span className="tiq-kpi-title">DISPATCH TRIAGE ALERTS</span>
              <div className="tiq-kpi-icon" style={{ background: pendingIncidents.length > 0 ? "#fef2f2" : "#ecfdf5", color: pendingIncidents.length > 0 ? "#dc2626" : "#059669" }}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="tiq-kpi-value" style={{ color: pendingIncidents.length > 0 ? "#dc2626" : "#059669" }}>
              {pendingIncidents.length} <span style={{ fontSize: "16px", color: "var(--text-subtle)", fontWeight: 600 }}>Pending</span>
            </div>
            <div className="tiq-kpi-subtitle">
              {pendingIncidents.length > 0 ? "Requires controller triage" : "Normal traffic flow"}
            </div>
          </div>
        </div>

        {/* Fleet Radar & Incident Resolution Queue */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px", marginBottom: "28px" }}>
          {/* City Radar Map */}
          <div className="tiq-panel" style={{ display: "flex", flexDirection: "column" }}>
            <div className="tiq-panel-header">
              <div>
                <div className="tiq-panel-title">City-Wide Fleet Radar</div>
                <div className="tiq-panel-subtitle">Live real-time positioning across all active Hyderabad buses</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="tiq-live-beacon">
                  <span className="tiq-beacon-dot"></span> Radar Streaming
                </div>
                <button
                  onClick={fetchData}
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--surface-ground)", border: "1px solid var(--surface-border)", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                >
                  <RefreshCw size={13} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} /> Sync
                </button>
              </div>
            </div>

            <div style={{ flex: 1, minHeight: "480px" }}>
              <TransitMap stops={mapStops} buses={mapBuses} height="100%" />
            </div>
          </div>

          {/* Incident Triage Queue */}
          <div className="tiq-panel" style={{ display: "flex", flexDirection: "column" }}>
            <div className="tiq-panel-header">
              <div>
                <div className="tiq-panel-title">Incident Triage Queue</div>
                <div className="tiq-panel-subtitle">Driver delay alerts & emergency notifications</div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 700, background: pendingIncidents.length > 0 ? "#fee2e2" : "#f1f5f9", color: pendingIncidents.length > 0 ? "#dc2626" : "var(--text-muted)", padding: "3px 8px", borderRadius: "6px" }}>
                {pendingIncidents.length} Open
              </span>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "440px" }}>
              {incidents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-subtle)", fontSize: "13px" }}>
                  <CheckCircle2 size={36} color="#10b981" style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontWeight: 700, color: "var(--text-main)" }}>No Active Disruptions</div>
                  <div>All corridors operating normally without reported delays.</div>
                </div>
              ) : (
                incidents.map((inc) => (
                  <div
                    key={inc.id}
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      background: inc.status === "resolved" ? "var(--surface-ground)" : "#fef2f2",
                      border: `1px solid ${inc.status === "resolved" ? "var(--surface-border)" : "#fecaca"}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: inc.status === "resolved" ? "#16a34a" : "#dc2626"
                      }}>
                        {inc.type} ALERT
                      </span>
                      <span style={{
                        fontSize: "10px",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontWeight: 700,
                        background: inc.status === "resolved" ? "#dcfce7" : "#fee2e2",
                        color: inc.status === "resolved" ? "#15803d" : "#b91c1c"
                      }}>
                        {inc.status}
                      </span>
                    </div>

                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>
                      {inc.description}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "8px", marginTop: "4px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Driver: {inc.driver_name || "Mohammad Ali"}
                      </span>

                      {inc.status !== "resolved" && (
                        <button
                          onClick={() => resolveIncident(inc.id)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            background: "#16a34a",
                            color: "white",
                            border: "none",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)"
                          }}
                        >
                          <CheckCircle2 size={13} /> Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Master Fleet Roster Table */}
        <div className="tiq-panel">
          <div className="tiq-panel-header">
            <div>
              <div className="tiq-panel-title">Active Fleet Roster & Duty Assignments</div>
              <div className="tiq-panel-subtitle">Current shifts, assigned routes, and vehicle telemetry statuses</div>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="tiq-table">
              <thead>
                <tr>
                  <th>CORRIDOR</th>
                  <th>BUS IDENTIFICATION</th>
                  <th>ASSIGNED DRIVER</th>
                  <th>OPERATING SHIFT</th>
                  <th>DISPATCH STATUS</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text-main)" }}>
                        Route {s.route.route_code}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {s.route.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text-main)" }}>
                        {s.bus.license_plate}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {s.bus.model}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#f3e8ff", color: "#6b21a8", fontSize: "11px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {s.driver_name.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{s.driver_name}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--text-muted)" }}>
                      {s.start_time} - {s.end_time}
                    </td>
                    <td>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#ecfdf5",
                        color: "#059669",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }}></span>
                        Active on Route
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OperatorDashboard;