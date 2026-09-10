import {
  AlertTriangle,
  BusFront,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  Shield,
  Navigation,
  Radio,
  LogOut,
  Route as RouteIcon,
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
        localStorage.setItem(
          "transitiq_user",
          JSON.stringify({
            name: "Passenger",
            role: "passenger",
            email: "passenger@test.com",
          })
        );
      } else if (targetRole === "driver") {
        localStorage.setItem("transitiq_token", "demo_driver");
        localStorage.setItem(
          "transitiq_user",
          JSON.stringify({
            name: "Mohammad Ali",
            role: "driver",
            email: "driver@test.com",
          })
        );
      } else {
        localStorage.setItem("transitiq_token", "demo_op");
        localStorage.setItem(
          "transitiq_user",
          JSON.stringify({
            name: "Rajesh Kumar",
            role: "operator",
            email: "operator@test.com",
          })
        );
      }
    }
    navigate(path);
  };

  // Clock
  useEffect(() => {
    const timer = setInterval(
      () => setCurrentTime(new Date().toLocaleTimeString()),
      1000
    );
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
              <Shield size={20} />
            </div>
            <span>TransitIQ</span>
          </Link>

          {/* Navigation Pills */}
          <nav className="navbar-links">
            <button
              onClick={() => switchToPortal("passenger", "/passenger")}
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
              className="active"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Shield size={14} /> Operator Radar
            </button>
          </nav>

          {/* Time & Controller Status */}
          <div className="navbar-actions">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(10, 16, 28, 0.8)",
                padding: "6px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border-glass)",
                fontSize: "12px",
                fontWeight: 700,
                color: "#ffffff",
                fontFamily: "var(--font-mono)",
              }}
            >
              <Clock3 size={14} color="#06b6d4" /> {currentTime} IST
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px",
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    background: "linear-gradient(135deg, #059669, #10b981)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  {user.name ? user.name[0].toUpperCase() : "O"}
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                  {user.name || "Rajesh Kumar"}
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

      {/* Main Workspace - Neatly aligned to 1280px */}
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
                color: "#10b981",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              CENTRAL DISPATCH & FLEET SURVEILLANCE
            </span>
            <h1
              style={{
                fontSize: "30px",
                fontWeight: 800,
                color: "#ffffff",
                marginTop: "4px",
              }}
            >
              Fleet Command Radar
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-body)", marginTop: "4px" }}>
              City-wide telemetry surveillance, live incident triage dispatch, and master fleet rosters.
            </p>
          </div>

          <button
            onClick={fetchData}
            className="secondary-button"
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
            }}
          >
            <RefreshCw
              size={14}
              style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}
            />
            <span>Refresh Fleet Data</span>
          </button>
        </div>

        {/* 4 KPI Cards - Home page style */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "28px",
          }}
        >
          {/* KPI 1 */}
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
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                ACTIVE FLEET
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
                fontSize: "24px",
                fontWeight: 800,
                color: "#34d399",
                fontFamily: "var(--font-mono)",
              }}
            >
              {activeBusesCount} / {buses.length}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-body)", marginTop: "4px" }}>
              100% active transit availability
            </div>
          </div>

          {/* KPI 2 */}
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
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                TRANSIT CORRIDORS
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
                <RouteIcon size={16} />
              </div>
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#ffffff",
                fontFamily: "var(--font-mono)",
              }}
            >
              {routes.length} Lines
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-body)", marginTop: "4px" }}>
              Core North-South & IT Corridors
            </div>
          </div>

          {/* KPI 3 */}
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
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                MONITORED STATIONS
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(6, 182, 212, 0.15)",
                  color: "#38bdf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapPin size={16} />
              </div>
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#38bdf8",
                fontFamily: "var(--font-mono)",
              }}
            >
              {stops.length} Stations
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-body)", marginTop: "4px" }}>
              Hyderabad Metropolitan Network
            </div>
          </div>

          {/* KPI 4 */}
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
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                DISPATCH ALERTS
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background:
                    pendingIncidents.length > 0
                      ? "rgba(244, 63, 94, 0.15)"
                      : "rgba(16, 185, 129, 0.15)",
                  color: pendingIncidents.length > 0 ? "#f43f5e" : "#34d399",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertTriangle size={16} />
              </div>
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: pendingIncidents.length > 0 ? "#f43f5e" : "#34d399",
                fontFamily: "var(--font-mono)",
              }}
            >
              {pendingIncidents.length} Pending
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-body)", marginTop: "4px" }}>
              {pendingIncidents.length > 0
                ? "Requires triage dispatch"
                : "All corridors normal"}
            </div>
          </div>
        </div>

        {/* Fleet Radar & Incident Resolution Queue */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "24px",
            marginBottom: "28px",
            alignItems: "start",
          }}
        >
          {/* City Radar Map */}
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
                    color: "#10b981",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  METROPOLITAN RADAR
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>
                  City-Wide Fleet Radar
                </h3>
              </div>

              <div className="beacon-live">
                <span className="beacon-dot"></span>
                <span>Streaming Telemetry</span>
              </div>
            </div>

            <div
              style={{
                height: "460px",
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid var(--border-glass)",
              }}
            >
              <TransitMap stops={mapStops} buses={mapBuses} height="100%" />
            </div>
          </div>

          {/* Incident Triage Queue */}
          <div
            className="glass-panel"
            style={{ padding: "24px", display: "flex", flexDirection: "column" }}
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
                  Incident Triage
                </h3>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Driver delay alerts & hazards
                </div>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  background:
                    pendingIncidents.length > 0
                      ? "rgba(244, 63, 94, 0.15)"
                      : "rgba(16, 185, 129, 0.15)",
                  border: `1px solid ${
                    pendingIncidents.length > 0
                      ? "rgba(244, 63, 94, 0.3)"
                      : "rgba(16, 185, 129, 0.3)"
                  }`,
                  color: pendingIncidents.length > 0 ? "#f43f5e" : "#34d399",
                  padding: "4px 10px",
                  borderRadius: "8px",
                }}
              >
                {pendingIncidents.length} Open
              </span>
            </div>

            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                paddingRight: "4px",
              }}
            >
              {incidents.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 20px",
                    color: "var(--text-muted)",
                    fontSize: "13px",
                  }}
                >
                  <CheckCircle2 size={36} color="#10b981" style={{ margin: "0 auto 10px" }} />
                  <div style={{ fontWeight: 700, color: "#ffffff" }}>No Disruptions</div>
                  <div style={{ marginTop: "4px" }}>
                    All corridors operating normally without reported delays.
                  </div>
                </div>
              ) : (
                incidents.map((inc) => (
                  <div
                    key={inc.id}
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      background:
                        inc.status === "resolved"
                          ? "rgba(10, 16, 28, 0.5)"
                          : "rgba(244, 63, 94, 0.08)",
                      border: `1px solid ${
                        inc.status === "resolved"
                          ? "var(--border-glass)"
                          : "rgba(244, 63, 94, 0.3)"
                      }`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: inc.status === "resolved" ? "#34d399" : "#f43f5e",
                        }}
                      >
                        {inc.type} ALERT
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontWeight: 700,
                          background:
                            inc.status === "resolved"
                              ? "rgba(16, 185, 129, 0.15)"
                              : "rgba(244, 63, 94, 0.15)",
                          color: inc.status === "resolved" ? "#34d399" : "#fda4af",
                        }}
                      >
                        {inc.status}
                      </span>
                    </div>

                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                      {inc.description}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid var(--border-glass)",
                        paddingTop: "8px",
                        marginTop: "2px",
                      }}
                    >
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Driver: {inc.driver_name || "Mohammad Ali"}
                      </span>

                      {inc.status !== "resolved" && (
                        <button
                          onClick={() => resolveIncident(inc.id)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            background: "linear-gradient(135deg, #059669, #10b981)",
                            color: "white",
                            border: "none",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                          }}
                        >
                          <CheckCircle2 size={12} /> Mark Resolved
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
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
            }}
          >
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>
                Active Fleet Roster & Duty Assignments
              </h3>
              <div style={{ fontSize: "13px", color: "var(--text-body)", marginTop: "2px" }}>
                Current shifts, assigned corridors, and vehicle telemetry status
              </div>
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
                      <div style={{ fontWeight: 700, color: "#ffffff" }}>
                        Route {s.route.route_code}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {s.route.name}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#ffffff",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {s.bus.license_plate}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {s.bus.model}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "rgba(99, 102, 241, 0.2)",
                            color: "#a5b4fc",
                            fontSize: "11px",
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                          }}
                        >
                          {s.driver_name.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: "#ffffff" }}>
                          {s.driver_name}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        fontWeight: 600,
                        color: "var(--text-body)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.start_time} - {s.end_time}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "rgba(16, 185, 129, 0.12)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          color: "#34d399",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        <span className="beacon-dot"></span>
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