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
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import TransitMap from "../../components/TransitMap";

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

  // Load user
  const userData = localStorage.getItem("transitiq_user");
  const user = userData ? JSON.parse(userData) : { name: "Mohammad Ali" };

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

      const simSpeed = Math.floor(34 + Math.random() * 12);
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
          description: incidentDesc || `${incidentType.toUpperCase()} reported on route`,
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
    <div className="driver-dashboard">
      {/* Navbar */}
      <header className="driver-navbar">
        <a href="/" className="driver-brand">
          <div className="driver-brand-icon">
            <BusFront size={19} />
          </div>
          TransitIQ
        </a>

        <nav className="driver-nav-links">
          <a href="/driver" className="active">
            Cockpit
          </a>
          <a href="/passenger">Passenger View</a>
          <a href="/operator">Operator Console</a>
        </nav>

        <div className="driver-profile">
          <div className="driver-avatar">
            {user.name ? user.name.slice(0, 2).toUpperCase() : "DR"}
          </div>
          <div>
            <strong>{user.name || "Mohammad Ali"}</strong>
            <span>Active Driver</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px" }}>
        {/* Header Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <span style={{ color: "#7c3aed", fontWeight: 600, fontSize: "12px", letterSpacing: "0.05em" }}>
              DRIVER TELEMETRY CONSOLE
            </span>
            <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "4px 0" }}>
              Live Route Dispatch & Telemetry
            </h1>
            <p style={{ color: "#64748b" }}>
              Stream your GPS location over WebSockets in real time to passengers & dispatch.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setShowIncidentModal(true)}
              style={{ background: "#fff", color: "#d97706", border: "1px solid #fde68a", padding: "8px 16px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <AlertTriangle size={16} /> Report Incident
            </button>
          </div>
        </div>

        {/* Cockpit HUD and Map */}
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px" }}>
          {/* Left Controls & HUD */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "white", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                Select Assigned Duty
              </label>
              <select
                value={selectedSchedule?.id || ""}
                onChange={(e) => {
                  const s = schedules.find((item) => item.id === Number(e.target.value));
                  setSelectedSchedule(s);
                  stopSimulation();
                }}
                style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1", fontWeight: 600, marginBottom: "16px" }}
              >
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    Route {s.route.route_code}: {s.bus.license_plate} ({s.start_time} - {s.end_time})
                  </option>
                ))}
              </select>

              {/* HUD Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Gauge size={13} /> SPEED
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "#2563eb", marginTop: "2px" }}>
                    {isDriving ? speed : 0} <span style={{ fontSize: "12px", color: "#64748b" }}>km/h</span>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Navigation size={13} /> PROGRESS
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "#0284c7", marginTop: "2px" }}>
                    {progressPct}%
                  </div>
                </div>
              </div>

              {nextStop && (
                <div style={{ background: "#eff6ff", padding: "12px", borderRadius: "10px", border: "1px solid #dbeafe", marginBottom: "20px" }}>
                  <div style={{ fontSize: "11px", color: "#2563eb", fontWeight: 600 }}>NEXT APPROACHING STATION</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e3a8a", marginTop: "2px" }}>
                    {nextStop.name} (Stop #{nextStop.sequence + 1})
                  </div>
                </div>
              )}

              {/* Controls */}
              {!isDriving ? (
                <button
                  onClick={startSimulation}
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "#2563eb", color: "white", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <Play size={18} /> Start Route Run (Simulate GPS)
                </button>
              ) : (
                <button
                  onClick={stopSimulation}
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "#ef4444", color: "white", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <Square size={18} /> Pause / Stop Run
                </button>
              )}
            </div>

            <div style={{ background: "white", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#64748b" }}>
              <div><strong>Vehicle:</strong> {selectedSchedule?.bus?.license_plate || "TS-09-UA-1234"}</div>
              <div><strong>Route:</strong> {selectedSchedule?.route?.name}</div>
              <div><strong>Shift:</strong> {selectedSchedule?.start_time} - {selectedSchedule?.end_time}</div>
            </div>
          </div>

          {/* Map View */}
          <div style={{ background: "white", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                Cockpit Telemetry Map
              </div>
              <div style={{ fontSize: "12px", color: isDriving ? "#16a34a" : "#94a3b8", fontWeight: 600 }}>
                {isDriving ? "● Broadcasting Live GPS Coordinates" : "● Telemetry Paused"}
              </div>
            </div>
            <div style={{ flex: 1, minHeight: "460px" }}>
              <TransitMap stops={stops} buses={activeBus} routeLine={routeLine} height="100%" />
            </div>
          </div>
        </div>
      </main>

      {/* Incident Modal */}
      {showIncidentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ width: "420px", background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", color: "#0f172a" }}>
              <AlertTriangle color="#d97706" /> Report Route Incident
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 16px 0" }}>
              Notify Central Dispatch and passenger hubs of unexpected delays.
            </p>

            {incidentSuccess ? (
              <div style={{ textAlign: "center", padding: "24px", color: "#16a34a" }}>
                <CheckCircle2 size={42} style={{ margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 700 }}>Incident Dispatched to Operator!</div>
              </div>
            ) : (
              <form onSubmit={handleReportIncident} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                    CATEGORY
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="traffic">Traffic Jam / Congestion</option>
                    <option value="breakdown">Mechanical Breakdown</option>
                    <option value="accident">Road Obstruction / Accident</option>
                    <option value="medical">Medical Emergency</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Details (e.g., Heavy jam near Begumpet, 15m delay expected)..."
                    value={incidentDesc}
                    onChange={(e) => setIncidentDesc(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", resize: "none" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setShowIncidentModal(false)}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: "8px 16px", borderRadius: "8px", background: "#2563eb", color: "white", border: "none", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Send size={14} /> Dispatch Alert
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