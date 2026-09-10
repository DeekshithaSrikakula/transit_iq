import {
  AlertTriangle,
  BusFront,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Play,
  Square,
  Gauge,
  Send,
  Radio,
  LogOut,
  Shield,
  Zap,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import TransitMap from "../../components/TransitMap";
import "../../dashboard.css";

const API_BASE = "http://localhost:5000/api";

function DriverDashboard() {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [routeDetail, setRouteDetail] = useState(null);

  // Simulation state
  const [isDriving, setIsDriving] = useState(false);
  const [currentCoord, setCurrentCoord] = useState(null);
  const [speed, setSpeed] = useState(38);
  const [nextStopIndex, setNextStopIndex] = useState(1);
  const [progressPct, setProgressPct] = useState(0);

  // Incident state
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentType, setIncidentType] = useState("traffic");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [incidentSuccess, setIncidentSuccess] = useState(false);

  const socketRef = useRef(null);
  const simIntervalRef = useRef(null);
  const stopIndexRef = useRef(0);
  const stepRatioRef = useRef(0);
  const navigate = useNavigate();

  // Load driver profile
  const userData = localStorage.getItem("transitiq_user");
  const user = userData ? JSON.parse(userData) : { name: "Mohammad Ali" };

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
      } else if (targetRole === "operator") {
        localStorage.setItem("transitiq_token", "demo_op");
        localStorage.setItem("transitiq_user", JSON.stringify({ name: "Rajesh Kumar", role: "operator", email: "operator@test.com" }));
      } else {
        localStorage.setItem("transitiq_token", "demo_driver");
        localStorage.setItem("transitiq_user", JSON.stringify({ name: "Mohammad Ali", role: "driver", email: "driver@test.com" }));
      }
    }
    navigate(path);
  };

  // Fetch driver schedules
  useEffect(() => {
    fetch(`${API_BASE}/schedules`)
      .then((r) => r.json())
      .then((data) => {
        setSchedules(data);
        if (data.length > 0) setSelectedSchedule(data[0]);
      })
      .catch(console.error);
  }, []);

  // Fetch route details
  useEffect(() => {
    if (!selectedSchedule) return;
    fetch(`${API_BASE}/routes/${selectedSchedule.route_id}`)
      .then((r) => r.json())
      .then((data) => {
        setRouteDetail(data);
        if (data.stop_associations && data.stop_associations.length > 0) {
          const first = data.stop_associations[0].stop;
          setCurrentCoord({ latitude: first.latitude, longitude: first.longitude });
          stopIndexRef.current = 0;
          stepRatioRef.current = 0;
          setNextStopIndex(1);
          setProgressPct(0);
        }
      })
      .catch(console.error);
  }, [selectedSchedule]);

  // Connect Driver WebSocket
  useEffect(() => {
    if (!selectedSchedule) return;
    const busId = selectedSchedule.bus_id || 1;
    const ws = new WebSocket(`ws://localhost:5000/ws/driver/${busId}`);
    socketRef.current = ws;

    return () => {
      if (ws) ws.close();
    };
  }, [selectedSchedule]);

  // GPS Simulation
  const startSimulation = () => {
    if (!routeDetail || !routeDetail.stop_associations) return;
    setIsDriving(true);
    const stops = routeDetail.stop_associations.map((a) => a.stop);

    simIntervalRef.current = setInterval(() => {
      const currIdx = stopIndexRef.current;
      const nextIdx = (currIdx + 1) % stops.length;

      stepRatioRef.current += 0.1;
      if (stepRatioRef.current >= 1.0) {
        stepRatioRef.current = 0;
        stopIndexRef.current = nextIdx;
        setNextStopIndex((nextIdx + 1) % stops.length);
      }

      const p1 = stops[stopIndexRef.current];
      const p2 = stops[(stopIndexRef.current + 1) % stops.length];

      const lat = p1.latitude + (p2.latitude - p1.latitude) * stepRatioRef.current;
      const lng = p1.longitude + (p2.longitude - p1.longitude) * stepRatioRef.current;
      const loc = { latitude: lat, longitude: lng };
      setCurrentCoord(loc);

      const simSpeed = Math.floor(34 + Math.random() * 14);
      setSpeed(simSpeed);

      const totalPct = Math.round(((stopIndexRef.current + stepRatioRef.current) / stops.length) * 100);
      setProgressPct(totalPct);

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            bus_id: selectedSchedule.bus_id,
            route_id: selectedSchedule.route_id,
            latitude: lat,
            longitude: lng,
            speed: simSpeed,
          })
        );
      }
    }, 1500);
  };

  const stopSimulation = () => {
    setIsDriving(false);
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
  };

  // Report Incident
  const handleReportIncident = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedule_id: selectedSchedule?.id || 1,
          type: incidentType,
          description: incidentDesc || `${incidentType.toUpperCase()} reported on active route`,
        }),
      });

      if (res.ok) {
        setIncidentSuccess(true);
        setIncidentDesc("");
        setTimeout(() => {
          setShowIncidentModal(false);
          setIncidentSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stops = (routeDetail?.stop_associations || []).map((a) => ({
    id: a.stop.id,
    name: a.stop.name,
    latitude: a.stop.latitude,
    longitude: a.stop.longitude,
    sequence: a.sequence,
  }));

  const routeLine = stops.map((s) => [s.latitude, s.longitude]);

  const activeBus = currentCoord
    ? [
        {
          bus_id: selectedSchedule?.bus_id,
          license_plate: selectedSchedule?.bus?.license_plate || "TS-09-UA-1234",
          latitude: currentCoord.latitude,
          longitude: currentCoord.longitude,
          speed: isDriving ? speed : 0,
          status: isDriving ? "active" : "idle",
        },
      ]
    : [];

  const nextStop = stops[nextStopIndex] || stops[0];

  return (
    <div className="tiq-dashboard-container">
      {/* Top Navigation Bar */}
      <header className="tiq-top-nav">
        <Link to="/" className="tiq-brand-badge">
          <div className="tiq-brand-icon-box" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
            <BusFront size={20} />
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Transit<span style={{ color: "#7c3aed" }}>IQ</span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
              DRIVER COCKPIT TELEMETRY
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
            className="tiq-nav-pill active"
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

        {/* Status & Driver Details */}
        <div className="tiq-user-status-card">
          <div className="tiq-live-beacon" style={{ background: isDriving ? "#ecfdf5" : "#fef3c7", color: isDriving ? "#065f46" : "#92400e" }}>
            <span className="tiq-beacon-dot" style={{ background: isDriving ? "#10b981" : "#f59e0b" }}></span>
            {isDriving ? "Telemetry Live" : "Duty Standby"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "12px", borderLeft: "1px solid var(--surface-border)" }}>
            <div className="tiq-avatar" style={{ background: "#f3e8ff", color: "#6b21a8", borderColor: "#e9d5ff" }}>
              {user.name ? user.name.slice(0, 2).toUpperCase() : "DR"}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>{user.name || "Mohammad Ali"}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Certified Driver</div>
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
        <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: "24px" }}>
          {/* Left Column: Dark Cockpit Control Hub */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Dark Mode HUD */}
            <div className="tiq-cockpit-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    VEHICLE INSTRUMENT HUD
                  </span>
                  <div style={{ fontSize: "17px", fontWeight: 800, color: "white", marginTop: "2px" }}>
                    {selectedSchedule?.bus?.license_plate || "TS-09-UA-1234"}
                  </div>
                </div>

                <span style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: "20px",
                  background: isDriving ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.1)",
                  color: isDriving ? "#34d399" : "#94a3b8",
                  border: isDriving ? "1px solid rgba(52, 211, 153, 0.4)" : "1px solid rgba(255,255,255,0.1)"
                }}>
                  {isDriving ? "LIVE STREAMING" : "IDLE"}
                </span>
              </div>

              {/* Digital Speedometer Ring */}
              <div className="tiq-cockpit-speed-ring" style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em" }}>
                  CURRENT SPEED
                </div>
                <div className="tiq-cockpit-speed-number">
                  {isDriving ? speed : 0}
                </div>
                <div style={{ fontSize: "13px", color: "#38bdf8", fontWeight: 700 }}>
                  KILOMETERS / HOUR
                </div>
              </div>

              {/* Next Station Indicator */}
              {nextStop && (
                <div style={{ background: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(51, 65, 85, 0.8)", borderRadius: "12px", padding: "14px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: 700 }}>APPROACHING STATION</span>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>Stop #{nextStop.sequence + 1} of {stops.length}</span>
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "white" }}>
                    {nextStop.name}
                  </div>
                </div>
              )}

              {/* Trip Progress Bar */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                  <span style={{ color: "#94a3b8" }}>Route Progress</span>
                  <strong style={{ color: "#38bdf8" }}>{progressPct}%</strong>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#1e293b", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${progressPct}%`, height: "100%", background: "linear-gradient(90deg, #2563eb, #38bdf8)", transition: "width 0.4s ease" }}></div>
                </div>
              </div>

              {/* Control Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {!isDriving ? (
                  <button
                    onClick={startSimulation}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                      color: "white",
                      fontWeight: 800,
                      fontSize: "14px",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)",
                    }}
                  >
                    <Play size={18} /> Start Route Run (Stream Live GPS)
                  </button>
                ) : (
                  <button
                    onClick={stopSimulation}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "12px",
                      background: "#ef4444",
                      color: "white",
                      fontWeight: 800,
                      fontSize: "14px",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
                    }}
                  >
                    <Square size={18} /> Stop / Pause Route Run
                  </button>
                )}

                <button
                  onClick={() => setShowIncidentModal(true)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#fbbf24",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <AlertTriangle size={16} /> Report Road Incident / Delay
                </button>
              </div>
            </div>

            {/* Duty Assignment Card */}
            <div className="tiq-panel" style={{ padding: "20px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>
                Switch Assigned Roster Shift
              </label>
              <select
                value={selectedSchedule?.id || ""}
                onChange={(e) => {
                  const s = schedules.find((item) => item.id === Number(e.target.value));
                  setSelectedSchedule(s);
                  stopSimulation();
                }}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--surface-border)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-main)",
                  outline: "none",
                  background: "var(--surface-ground)",
                  cursor: "pointer",
                }}
              >
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    Route {s.route.route_code}: {s.bus.license_plate} ({s.start_time} - {s.end_time})
                  </option>
                ))}
              </select>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px", fontSize: "12px", borderTop: "1px solid var(--surface-border)", paddingTop: "14px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Assigned Line</span>
                  <strong style={{ color: "var(--text-main)", fontSize: "13px" }}>{selectedSchedule?.route?.name}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>Duty Hours</span>
                  <strong style={{ color: "var(--text-main)", fontSize: "13px" }}>{selectedSchedule?.start_time} - {selectedSchedule?.end_time}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Telemetry Map & Diagnostics */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="tiq-panel" style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column" }}>
              <div className="tiq-panel-header">
                <div>
                  <div className="tiq-panel-title">
                    Cockpit Live Map
                  </div>
                  <div className="tiq-panel-subtitle">
                    GPS coordinates stream to Central Dispatch and passenger screens in real time
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div className="tiq-live-beacon">
                    <span className="tiq-beacon-dot" style={{ background: isDriving ? "#10b981" : "#94a3b8" }}></span>
                    {isDriving ? "Transmitting at 1.5s interval" : "Ready"}
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, minHeight: "520px" }}>
                <TransitMap stops={stops} buses={activeBus} routeLine={routeLine} height="100%" />
              </div>
            </div>

            {/* Quick Cockpit Telemetry Stats */}
            <div className="tiq-panel" style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>VEHICLE BATTERY / FUEL</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#16a34a", marginTop: "2px" }}>94% Optimal</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>ON-TIME PERFORMANCE</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#2563eb", marginTop: "2px" }}>+0m Exact</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>RADIO PROTOCOL</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-main)", marginTop: "2px" }}>WebSocket / WSS</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>NEXT DISPATCH CHECK</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#d97706", marginTop: "2px" }}>16:00 Terminal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Incident Modal */}
      {showIncidentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="tiq-panel" style={{ width: "440px", padding: "28px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, display: "flex", alignItems: "center", gap: "10px", color: "var(--text-main)" }}>
              <AlertTriangle color="#d97706" /> Dispatch Incident Alert
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "6px 0 20px 0" }}>
              Notify Central Operations and route controllers of road hazards or delays.
            </p>

            {incidentSuccess ? (
              <div style={{ textAlign: "center", padding: "24px", color: "#16a34a" }}>
                <CheckCircle2 size={46} style={{ margin: "0 auto 10px" }} />
                <div style={{ fontWeight: 800, fontSize: "16px" }}>Incident Dispatched to Central Radar!</div>
              </div>
            ) : (
              <form onSubmit={handleReportIncident} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                    INCIDENT CATEGORY
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--surface-border)", fontWeight: 600 }}
                  >
                    <option value="traffic">Traffic Congestion / Flyover Jam</option>
                    <option value="breakdown">Mechanical Engine Breakdown</option>
                    <option value="accident">Road Obstruction / Collision</option>
                    <option value="medical">Passenger Medical Assistance</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                    DETAILS & LOCATION
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details (e.g., Heavy jam near Begumpet, 15m delay expected)..."
                    value={incidentDesc}
                    onChange={(e) => setIncidentDesc(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--surface-border)", resize: "none" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setShowIncidentModal(false)}
                    style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid var(--surface-border)", background: "white", fontWeight: 600, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: "10px 20px", borderRadius: "10px", background: "#2563eb", color: "white", border: "none", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <Send size={15} /> Dispatch Alert
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverDashboard;