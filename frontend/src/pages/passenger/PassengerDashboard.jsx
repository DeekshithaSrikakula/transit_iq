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
  X,
  QrCode,
  ArrowRight,
  Download,
  Info,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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

// Clean standalone QR Matrix component
function QRCodeVisual() {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: "16px",
        borderRadius: "16px",
        display: "inline-block",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      <svg width="170" height="170" viewBox="0 0 100 100" fill="#0f172a">
        {/* Finder Pattern Top-Left */}
        <rect x="6" y="6" width="24" height="24" rx="3" fill="#0f172a" />
        <rect x="10" y="10" width="16" height="16" rx="2" fill="#ffffff" />
        <rect x="14" y="14" width="8" height="8" rx="1.5" fill="#4f46e5" />

        {/* Finder Pattern Top-Right */}
        <rect x="70" y="6" width="24" height="24" rx="3" fill="#0f172a" />
        <rect x="74" y="10" width="16" height="16" rx="2" fill="#ffffff" />
        <rect x="78" y="14" width="8" height="8" rx="1.5" fill="#4f46e5" />

        {/* Finder Pattern Bottom-Left */}
        <rect x="6" y="70" width="24" height="24" rx="3" fill="#0f172a" />
        <rect x="10" y="74" width="16" height="16" rx="2" fill="#ffffff" />
        <rect x="14" y="78" width="8" height="8" rx="1.5" fill="#4f46e5" />

        {/* Synthetic Matrix Grid */}
        <rect x="36" y="8" width="5" height="5" rx="1" />
        <rect x="46" y="8" width="5" height="5" rx="1" />
        <rect x="56" y="8" width="5" height="5" rx="1" />
        <rect x="36" y="18" width="5" height="5" rx="1" />
        <rect x="44" y="18" width="5" height="5" rx="1" />
        <rect x="52" y="18" width="5" height="5" rx="1" />
        <rect x="36" y="28" width="5" height="5" rx="1" />
        <rect x="46" y="28" width="5" height="5" rx="1" />
        <rect x="56" y="28" width="5" height="5" rx="1" />

        <rect x="8" y="38" width="5" height="5" rx="1" />
        <rect x="18" y="38" width="5" height="5" rx="1" />
        <rect x="28" y="38" width="5" height="5" rx="1" />
        <rect x="38" y="38" width="5" height="5" rx="1" />
        <rect x="48" y="38" width="5" height="5" rx="1" />
        <rect x="58" y="38" width="5" height="5" rx="1" />
        <rect x="68" y="38" width="5" height="5" rx="1" />
        <rect x="78" y="38" width="5" height="5" rx="1" />
        <rect x="88" y="38" width="5" height="5" rx="1" />

        {/* Center Accent */}
        <circle cx="50" cy="50" r="9" fill="#06b6d4" />
        <path d="M47 48 L50 45 L53 48 L50 54 Z" fill="#ffffff" />

        <rect x="38" y="66" width="5" height="5" rx="1" />
        <rect x="48" y="66" width="5" height="5" rx="1" />
        <rect x="58" y="66" width="5" height="5" rx="1" />
        <rect x="68" y="66" width="5" height="5" rx="1" />
        <rect x="78" y="66" width="5" height="5" rx="1" />
        <rect x="88" y="66" width="5" height="5" rx="1" />
        <rect x="38" y="76" width="5" height="5" rx="1" />
        <rect x="48" y="76" width="5" height="5" rx="1" />
        <rect x="58" y="76" width="5" height="5" rx="1" />
        <rect x="68" y="76" width="5" height="5" rx="1" />
        <rect x="88" y="76" width="5" height="5" rx="1" />
        <rect x="38" y="86" width="5" height="5" rx="1" />
        <rect x="58" y="86" width="5" height="5" rx="1" />
        <rect x="78" y="86" width="5" height="5" rx="1" />
        <rect x="88" y="86" width="5" height="5" rx="1" />
      </svg>
    </div>
  );
}

function PassengerDashboard() {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(1);
  const [routeDetail, setRouteDetail] = useState(null);
  const [liveBuses, setLiveBuses] = useState([]);
  const [searchStop, setSearchStop] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  
  // Interactive Station Modal & Digital Fare Pass states
  const [selectedStation, setSelectedStation] = useState(null);
  const [showPassModal, setShowPassModal] = useState(false);
  const [originStopId, setOriginStopId] = useState("");
  const [destStopId, setDestStopId] = useState("");
  const [activePass, setActivePass] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  // Sync URL route query param
  useEffect(() => {
    const routeParam = searchParams.get("route");
    if (routeParam) {
      const id = Number(routeParam);
      if (!isNaN(id) && id > 0) {
        setSelectedRouteId(id);
      }
    }
  }, [searchParams]);

  // Fetch routes
  useEffect(() => {
    fetch(`${API_BASE}/routes`)
      .then((r) => r.json())
      .then((data) => {
        setRoutes(data);
        const routeParam = searchParams.get("route");
        if (routeParam && data.some((r) => r.id === Number(routeParam))) {
          setSelectedRouteId(Number(routeParam));
        } else if (data.length > 0 && !selectedRouteId) {
          setSelectedRouteId(data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch route details
  useEffect(() => {
    if (!selectedRouteId) return;
    fetch(`${API_BASE}/routes/${selectedRouteId}`)
      .then((r) => r.json())
      .then((data) => {
        setRouteDetail(data);
        if (data?.stop_associations?.length > 0) {
          setOriginStopId(data.stop_associations[0].stop.id);
          setDestStopId(
            data.stop_associations[data.stop_associations.length - 1].stop.id
          );
        }
      })
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

  const originIndex = stops.findIndex((s) => s.id === Number(originStopId));
  const destIndex = stops.findIndex((s) => s.id === Number(destStopId));
  const hops =
    originIndex >= 0 && destIndex >= 0
      ? Math.abs(destIndex - originIndex)
      : Math.max(1, stops.length > 1 ? stops.length - 1 : 1);
  const calculatedFare = Math.max(15, 15 + hops * 3);

  const handleGeneratePass = () => {
    const originName =
      stops.find((s) => s.id === Number(originStopId))?.name ||
      stops[0]?.name ||
      "Secunderabad Station";
    const destName =
      stops.find((s) => s.id === Number(destStopId))?.name ||
      stops[stops.length - 1]?.name ||
      "Charminar";

    setActivePass({
      id: `TIQ-HYD-${Math.floor(100000 + Math.random() * 900000)}`,
      routeCode: routeDetail?.route_code || "5K",
      routeName: routeDetail?.name || "Hyderabad City Express",
      origin: originName,
      destination: destName,
      hops: Math.max(1, hops),
      fare: calculatedFare,
      passengerName: user.name || "Passenger",
      issuedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      validUntil: new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
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

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
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

            {/* Instant QR Pass Button */}
            <button
              type="button"
              onClick={() => {
                setActivePass(null);
                setShowPassModal(true);
              }}
              style={{
                padding: "10px 18px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 16px rgba(79, 70, 229, 0.4)",
                transition: "all 0.2s ease",
              }}
            >
              <Ticket size={16} /> Instant QR Pass
            </button>
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
            <button
              type="button"
              onClick={() => {
                setActivePass(null);
                setShowPassModal(true);
              }}
              style={{
                marginTop: "12px",
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: "8px",
                padding: "6px 12px",
                color: "#a5b4fc",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              <Sparkles size={13} color="#38bdf8" /> Book Digital Fare Pass &rarr;
            </button>
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
                    onClick={() => setSelectedStation(stop)}
                    title="Click to view station schedule & departures"
                    style={{
                      background: "rgba(10, 16, 28, 0.6)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "12px",
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
                      e.currentTarget.style.background = "rgba(18, 28, 48, 0.85)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-glass)";
                      e.currentTarget.style.background = "rgba(10, 16, 28, 0.6)";
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

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                      <ChevronRight size={14} color="var(--text-muted)" />
                    </div>
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
                  onStopClick={setSelectedStation}
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

      {/* ===================================================
          INTERACTIVE STATION DETAILS MODAL
          =================================================== */}
      {selectedStation && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 7, 18, 0.78)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setSelectedStation(null)}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: "500px",
              width: "100%",
              padding: "28px",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px",
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
                  STATION TELEMETRY • STOP #{selectedStation.sequence !== undefined ? selectedStation.sequence + 1 : 1}
                </span>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#ffffff",
                    marginTop: "4px",
                  }}
                >
                  {selectedStation.name}
                </h2>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Corridor: Line {routeDetail?.route_code} ({routeDetail?.name})
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStation(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "10px",
                  color: "var(--text-muted)",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Live Approaching Bus Status Card */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.12))",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#a5b4fc",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  NEXT INCOMING BUS
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#34d399",
                    marginTop: "2px",
                  }}
                >
                  {calculateETA(selectedStation.latitude, selectedStation.longitude) || "Due in 4 mins"}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-body)", marginTop: "2px" }}>
                  Vehicle: {activeBus?.license_plate || "TS-09-UA-1234"} • Speed:{" "}
                  {activeBus?.speed ? `${Math.round(activeBus.speed)} km/h` : "38 km/h"}
                </div>
              </div>

              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 0 16px rgba(99, 102, 241, 0.4)",
                }}
              >
                <BusFront size={22} />
              </div>
            </div>

            {/* Scheduled Upcoming Departures */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "var(--text-muted)",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                UPCOMING DEPARTURES FROM THIS STATION
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(10, 16, 28, 0.6)",
                    border: "1px solid var(--border-glass)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="beacon-dot" style={{ width: "6px", height: "6px" }}></span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                      Line {routeDetail?.route_code} AC Low-Floor
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#34d399" }}>
                    {calculateETA(selectedStation.latitude, selectedStation.longitude) || "Due in 4m"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(10, 16, 28, 0.6)",
                    border: "1px solid var(--border-glass)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Clock3 size={13} color="var(--text-muted)" />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-body)" }}>
                      Line {routeDetail?.route_code} AC Express
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#38bdf8" }}>
                    in 12 mins
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(10, 16, 28, 0.6)",
                    border: "1px solid var(--border-glass)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Clock3 size={13} color="var(--text-muted)" />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-body)" }}>
                      Line {routeDetail?.route_code} Urban City
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>
                    in 24 mins
                  </span>
                </div>
              </div>
            </div>

            {/* Station Amenities */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
              <span
                style={{
                  fontSize: "11px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-glass)",
                  padding: "5px 10px",
                  borderRadius: "8px",
                  color: "var(--text-muted)",
                }}
              >
                ♿ Accessible Ramp
              </span>
              <span
                style={{
                  fontSize: "11px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-glass)",
                  padding: "5px 10px",
                  borderRadius: "8px",
                  color: "var(--text-muted)",
                }}
              >
                ⚡ Digital Smart Shelter
              </span>
              <span
                style={{
                  fontSize: "11px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-glass)",
                  padding: "5px 10px",
                  borderRadius: "8px",
                  color: "var(--text-muted)",
                }}
              >
                🛡️ CCTV Monitored
              </span>
            </div>

            {/* Modal Action Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setOriginStopId(selectedStation.id);
                  setSelectedStation(null);
                  setActivePass(null);
                  setShowPassModal(true);
                }}
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 16px rgba(79, 70, 229, 0.4)",
                  transition: "all 0.2s ease",
                }}
              >
                <Ticket size={16} /> Book Pass from here
              </button>

              <button
                type="button"
                onClick={() => setSelectedStation(null)}
                style={{
                  padding: "12px 20px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "12px",
                  color: "var(--text-body)",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          DIGITAL QR BOARDING PASS & FARE MODAL
          =================================================== */}
      {showPassModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 7, 18, 0.8)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setShowPassModal(false)}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: "480px",
              width: "100%",
              padding: "28px",
              borderRadius: "22px",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.85)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowPassModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-glass)",
                borderRadius: "10px",
                color: "var(--text-muted)",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>

            {!activePass ? (
              /* Pass Configurator / Fare Calculator Form */
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
                  TSRTC METROPOLITAN TRANSIT
                </span>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                  Book Instant QR Boarding Pass
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Generate an authenticated digital travel pass for Line {routeDetail?.route_code} ({routeDetail?.name}).
                </p>

                {/* Origin Selector */}
                <div style={{ marginTop: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "6px",
                    }}
                  >
                    BOARDING STATION
                  </label>
                  <select
                    value={originStopId}
                    onChange={(e) => setOriginStopId(e.target.value)}
                    className="input-glass"
                    style={{ width: "100%", padding: "10px 14px", fontSize: "14px" }}
                  >
                    {stops.map((s, idx) => (
                      <option key={s.id} value={s.id} style={{ background: "#0f172a", color: "#ffffff" }}>
                        #{idx + 1} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Selector */}
                <div style={{ marginTop: "14px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "6px",
                    }}
                  >
                    DESTINATION STATION
                  </label>
                  <select
                    value={destStopId}
                    onChange={(e) => setDestStopId(e.target.value)}
                    className="input-glass"
                    style={{ width: "100%", padding: "10px 14px", fontSize: "14px" }}
                  >
                    {stops.map((s, idx) => (
                      <option key={s.id} value={s.id} style={{ background: "#0f172a", color: "#ffffff" }}>
                        #{idx + 1} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fare Summary Breakdown */}
                <div
                  style={{
                    background: "rgba(10, 16, 28, 0.7)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "14px",
                    padding: "16px",
                    marginTop: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Corridor Line:</span>
                    <span style={{ fontWeight: 700, color: "#ffffff" }}>Line {routeDetail?.route_code} AC Express</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Distance / Hops:</span>
                    <span style={{ fontWeight: 700, color: "#38bdf8" }}>{hops} stops (~{(hops * 1.8).toFixed(1)} km)</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Estimated Duration:</span>
                    <span style={{ fontWeight: 700, color: "#ffffff" }}>~{hops * 4} mins</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      paddingTop: "10px",
                      marginTop: "4px",
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff" }}>Total Fare Due:</span>
                    <span style={{ fontSize: "22px", fontWeight: 800, color: "#34d399", fontFamily: "var(--font-mono)" }}>
                      ₹{calculatedFare}
                    </span>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGeneratePass}
                  style={{
                    width: "100%",
                    padding: "14px",
                    marginTop: "20px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 6px 20px rgba(79, 70, 229, 0.4)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Sparkles size={16} /> Generate & Activate QR Pass
                </button>
              </div>
            ) : (
              /* Live Activated Boarding Pass View */
              <div style={{ textAlign: "center" }}>
                <div className="beacon-live" style={{ marginBottom: "14px", display: "inline-flex" }}>
                  <span className="beacon-dot"></span>
                  <span>Active & Verified Boarding Pass</span>
                </div>

                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px dashed rgba(99, 102, 241, 0.4)",
                    borderRadius: "18px",
                    padding: "20px",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div style={{ textAlign: "left" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "#38bdf8", letterSpacing: "0.08em" }}>
                        PASSENGER TICKET
                      </span>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff" }}>
                        {activePass.passengerName}
                      </div>
                    </div>
                    <div
                      style={{
                        background: "rgba(99, 102, 241, 0.2)",
                        border: "1px solid rgba(99, 102, 241, 0.4)",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#a5b4fc",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Line {activePass.routeCode}
                    </div>
                  </div>

                  {/* QR Code Visual */}
                  <div style={{ margin: "16px 0" }}>
                    <QRCodeVisual />
                  </div>

                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "13px",
                      fontWeight: 800,
                      color: "#38bdf8",
                      letterSpacing: "0.08em",
                      marginBottom: "12px",
                    }}
                  >
                    {activePass.id}
                  </div>

                  {/* Journey Route */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#ffffff",
                      marginBottom: "10px",
                    }}
                  >
                    <span>{activePass.origin}</span>
                    <ArrowRight size={14} color="#38bdf8" />
                    <span>{activePass.destination}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      paddingTop: "12px",
                    }}
                  >
                    <div>
                      <div>FARE PAID</div>
                      <strong style={{ color: "#34d399", fontSize: "14px" }}>₹{activePass.fare}</strong>
                    </div>
                    <div>
                      <div>ISSUED AT</div>
                      <strong style={{ color: "#ffffff" }}>{activePass.issuedAt}</strong>
                    </div>
                    <div>
                      <div>VALID UNTIL</div>
                      <strong style={{ color: "#f59e0b" }}>{activePass.validUntil}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "12px",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Download size={15} /> Save / Print Pass
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPassModal(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      border: "none",
                      borderRadius: "12px",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PassengerDashboard;