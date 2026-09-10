import {
  AlertTriangle,
  BusFront,
  CheckCircle2,
  Clock3,
  Play,
  Square,
  Radio,
  LogOut,
  Shield,
  Navigation,
  Send,
  Zap,
  Battery,
  Activity,
  Gauge,
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
        localStorage.setItem(
          "transitiq_user",
          JSON.stringify({
            name: "Passenger",
            role: "passenger",
            email: "passenger@test.com",
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
        localStorage.setItem("transitiq_token", "demo_driver");
        localStorage.setItem(
          "transitiq_user",
          JSON.stringify({
            name: "Mohammad Ali",
            role: "driver",
            email: "driver@test.com",
          })
        );
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

      const totalPct = Math.round(
        ((stopIndexRef.current + stepRatioRef.current) / stops.length) * 100
      );
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
          driver_id: selectedSchedule?.driver_id || "driver1",
          driver_name: user.name || "Mohammad Ali",
          type: incidentType,
          description: incidentDesc || "Congestion on active route",
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
              className="active"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
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

          {/* Status & Driver Details */}
          <div className="navbar-actions">
            <div className="beacon-live">
              <span
                className="beacon-dot"
                style={{ background: isDriving ? "#10b981" : "#f59e0b" }}
              ></span>
              <span>{isDriving ? "GPS Broadcast Active" : "Duty Standby"}</span>
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
                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  {user.name ? user.name[0].toUpperCase() : "D"}
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                  {user.name || "Mohammad Ali"}
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
                color: "#818cf8",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              REAL-TIME TELEMETRY TRANSMITTER
            </span>
            <h1
              style={{
                fontSize: "30px",
                fontWeight: 800,
                color: "#ffffff",
                marginTop: "4px",
              }}
            >
              Driver Cockpit & Dispatch
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-body)", marginTop: "4px" }}>
              Transmit sub-second live GPS coordinates to passenger radars and Central Operations.
            </p>
          </div>

          {/* Roster Shift Pill Selector */}
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
            {schedules.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedSchedule(s);
                  stopSimulation();
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  border:
                    selectedSchedule?.id === s.id
                      ? "1px solid rgba(99, 102, 241, 0.5)"
                      : "1px solid transparent",
                  background:
                    selectedSchedule?.id === s.id
                      ? "linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(6, 182, 212, 0.25))"
                      : "transparent",
                  color: selectedSchedule?.id === s.id ? "#ffffff" : "var(--text-body)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: selectedSchedule?.id === s.id ? "#38bdf8" : "var(--text-muted)",
                  }}
                >
                  Shift {s.route.route_code}
                </span>
                <span>{s.bus.license_plate}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cockpit Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "380px 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Left Column: Cockpit Instrument Cluster */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="glass-panel" style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    VEHICLE INSTRUMENT HUD
                  </span>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "#ffffff",
                      fontFamily: "var(--font-mono)",
                      marginTop: "2px",
                    }}
                  >
                    {selectedSchedule?.bus?.license_plate || "TS-09-UA-1234"}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: "20px",
                    background: isDriving
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(255, 255, 255, 0.08)",
                    color: isDriving ? "#34d399" : "#94a3b8",
                    border: isDriving
                      ? "1px solid rgba(16, 185, 129, 0.3)"
                      : "1px solid var(--border-glass)",
                  }}
                >
                  {isDriving ? "LIVE STREAMING" : "STANDBY"}
                </span>
              </div>

              {/* Digital Speedometer Gauge */}
              <div className="tiq-cockpit-speed-ring" style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  CURRENT SPEED
                </div>
                <div className="tiq-cockpit-speed-number">{isDriving ? speed : 0}</div>
                <div style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 700 }}>
                  KILOMETERS / HOUR
                </div>
              </div>

              {/* Next Station Proximity HUD */}
              {nextStop && (
                <div
                  style={{
                    background: "rgba(10, 16, 28, 0.6)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "14px",
                    padding: "16px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#38bdf8",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                      }}
                    >
                      APPROACHING STATION
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Stop #{nextStop.sequence + 1} of {stops.length}
                    </span>
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>
                    {nextStop.name}
                  </div>
                </div>
              )}

              {/* Route Progress Bar */}
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: "var(--text-body)" }}>Corridor Progress</span>
                  <strong style={{ color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
                    {progressPct}%
                  </strong>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${progressPct}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #4f46e5, #06b6d4)",
                      transition: "width 0.4s ease",
                    }}
                  ></div>
                </div>
              </div>

              {/* Control Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {!isDriving ? (
                  <button
                    onClick={startSimulation}
                    className="primary-button"
                    style={{ width: "100%", justifyContent: "center", cursor: "pointer" }}
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
                      background: "linear-gradient(135deg, #e11d48, #be123c)",
                      color: "white",
                      fontWeight: 800,
                      fontSize: "14px",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 15px rgba(225, 29, 72, 0.4)",
                    }}
                  >
                    <Square size={18} /> Stop / Pause Route Run
                  </button>
                )}

                <button
                  onClick={() => setShowIncidentModal(true)}
                  className="secondary-button"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#f59e0b",
                    borderColor: "rgba(245, 158, 11, 0.3)",
                    background: "rgba(245, 158, 11, 0.08)",
                  }}
                >
                  <AlertTriangle size={16} /> Report Road Incident / Delay
                </button>
              </div>
            </div>

            {/* Shift Summary Card */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
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
                  ROSTER SPECIFICATIONS
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#34d399",
                    background: "rgba(16, 185, 129, 0.12)",
                    padding: "3px 8px",
                    borderRadius: "6px",
                  }}
                >
                  Certified
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>
                    Assigned Line
                  </span>
                  <strong style={{ color: "#ffffff" }}>
                    {selectedSchedule?.route?.name || "Route 5K"}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>
                    Duty Hours
                  </span>
                  <strong style={{ color: "#ffffff", fontFamily: "var(--font-mono)" }}>
                    {selectedSchedule?.start_time} - {selectedSchedule?.end_time}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Telemetry Map & Diagnostics */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                    IN-CABIN GPS RADAR
                  </span>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>
                    Live Corridor Map
                  </h3>
                </div>

                <div className="beacon-live">
                  <span
                    className="beacon-dot"
                    style={{ background: isDriving ? "#10b981" : "#94a3b8" }}
                  ></span>
                  <span>{isDriving ? "Transmitting (1.5s)" : "Radio Ready"}</span>
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
                <TransitMap
                  stops={stops}
                  buses={activeBus}
                  routeLine={routeLine}
                  height="100%"
                />
              </div>
            </div>

            {/* Diagnostics Stats */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "16px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    VEHICLE BATTERY / FUEL
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "#34d399",
                      marginTop: "2px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    94% Optimal
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    ON-TIME PERFORMANCE
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "#38bdf8",
                      marginTop: "2px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    +0m Exact
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    RADIO PROTOCOL
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "#ffffff",
                      marginTop: "2px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    WebSocket WSS
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    NEXT TERMINAL CHECK
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "#f59e0b",
                      marginTop: "2px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    16:00 IST
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Incident Modal - Dark Glass Dialog */}
      {showIncidentModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8, 12, 21, 0.8)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "460px",
              padding: "28px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#ffffff",
              }}
            >
              <AlertTriangle color="#f59e0b" /> Dispatch Incident Alert
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-body)",
                margin: "6px 0 20px 0",
              }}
            >
              Notify Central Operations and route controllers of road hazards or delays.
            </p>

            {incidentSuccess ? (
              <div style={{ textAlign: "center", padding: "24px", color: "#34d399" }}>
                <CheckCircle2 size={46} style={{ margin: "0 auto 10px" }} />
                <div style={{ fontWeight: 800, fontSize: "16px" }}>
                  Incident Dispatched to Central Radar!
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleReportIncident}
                style={{ display: "flex", flexDirection: "column", gap: "16px" }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--text-heading)",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    INCIDENT CATEGORY
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="input-glass"
                    style={{ cursor: "pointer" }}
                  >
                    <option value="traffic">Traffic Congestion / Flyover Jam</option>
                    <option value="breakdown">Mechanical Engine Breakdown</option>
                    <option value="accident">Road Obstruction / Collision</option>
                    <option value="medical">Passenger Medical Assistance</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--text-heading)",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    DETAILS & LOCATION
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details (e.g., Heavy jam near Begumpet, 15m delay expected)..."
                    value={incidentDesc}
                    onChange={(e) => setIncidentDesc(e.target.value)}
                    className="input-glass"
                    style={{ resize: "none" }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "8px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowIncidentModal(false)}
                    className="secondary-button"
                    style={{ cursor: "pointer", padding: "10px 18px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="primary-button"
                    style={{ cursor: "pointer", padding: "10px 20px" }}
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