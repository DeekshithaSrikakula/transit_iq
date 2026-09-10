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
} from "lucide-react";
import { useState, useEffect } from "react";
import TransitMap from "../../components/TransitMap";

const API_BASE = "http://localhost:5000/api";

function OperatorDashboard() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [liveLocations, setLiveLocations] = useState([]);

  // Load user
  const userData = localStorage.getItem("transitiq_user");
  const user = userData ? JSON.parse(userData) : { name: "Rajesh Kumar" };

  const fetchData = async () => {
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
    <div className="operator-dashboard" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Navbar */}
      <header className="operator-navbar" style={{ background: "white", padding: "16px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "#0f172a", fontWeight: 700, fontSize: "18px" }}>
          <div style={{ background: "#2563eb", color: "white", padding: "6px", borderRadius: "8px" }}>
            <BusFront size={20} />
          </div>
          TransitIQ Central Dispatch
        </a>

        <nav style={{ display: "flex", gap: "16px" }}>
          <a href="/operator" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Radar Console</a>
          <a href="/passenger" style={{ color: "#64748b", textDecoration: "none" }}>Passenger View</a>
          <a href="/driver" style={{ color: "#64748b", textDecoration: "none" }}>Driver Portal</a>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>
            {user.name ? user.name.slice(0, 2).toUpperCase() : "OP"}
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700 }}>{user.name || "Rajesh Kumar"}</div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Chief Controller</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px" }}>
        {/* KPI Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "white", padding: "18px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>ACTIVE BUSES</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#16a34a", marginTop: "4px" }}>
              {activeBusesCount} <span style={{ fontSize: "14px", color: "#94a3b8" }}>/ {buses.length}</span>
            </div>
          </div>

          <div style={{ background: "white", padding: "18px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>TRANSIT CORRIDORS</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#2563eb", marginTop: "4px" }}>
              {routes.length} <span style={{ fontSize: "14px", color: "#94a3b8" }}>Routes</span>
            </div>
          </div>

          <div style={{ background: "white", padding: "18px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>TOTAL STATIONS</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0284c7", marginTop: "4px" }}>
              {stops.length} <span style={{ fontSize: "14px", color: "#94a3b8" }}>Stops</span>
            </div>
          </div>

          <div style={{ background: "white", padding: "18px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>DISPATCH ALERTS</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: pendingIncidents.length > 0 ? "#dc2626" : "#16a34a", marginTop: "4px" }}>
              {pendingIncidents.length} <span style={{ fontSize: "14px", color: "#94a3b8" }}>Pending</span>
            </div>
          </div>
        </div>

        {/* Map & Incidents Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", marginBottom: "24px" }}>
          {/* Fleet Radar Map */}
          <div style={{ background: "white", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                City-Wide Fleet Radar (Hyderabad)
              </div>
              <button
                onClick={fetchData}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}
              >
                <RefreshCw size={12} /> Refresh Radar
              </button>
            </div>
            <div style={{ flex: 1, minHeight: "460px" }}>
              <TransitMap stops={mapStops} buses={mapBuses} height="100%" />
            </div>
          </div>

          {/* Incident Resolution Queue */}
          <div style={{ background: "white", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>
              Live Incident Triage Queue
            </div>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
              Driver-reported delays and disruptions
            </p>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", maxHeight: "420px" }}>
              {incidents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8", fontSize: "13px" }}>
                  No active incidents. Transit flow normal.
                </div>
              ) : (
                incidents.map((inc) => (
                  <div
                    key={inc.id}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: inc.status === "resolved" ? "#f0fdf4" : "#fef2f2",
                      border: `1px solid ${inc.status === "resolved" ? "#bbf7d0" : "#fecaca"}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: inc.status === "resolved" ? "#16a34a" : "#dc2626" }}>
                        {inc.type}
                      </span>
                      <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "10px", background: inc.status === "resolved" ? "#16a34a" : "#ea580c", color: "white" }}>
                        {inc.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#1e293b" }}>{inc.description}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "6px", marginTop: "4px" }}>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Driver: {inc.driver_name || "Mohammad Ali"}</span>
                      {inc.status !== "resolved" && (
                        <button
                          onClick={() => resolveIncident(inc.id)}
                          style={{ padding: "4px 8px", borderRadius: "6px", background: "#16a34a", color: "white", border: "none", fontSize: "11px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
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

        {/* Master Driver Roster & Schedule Table */}
        <div style={{ background: "white", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>
            Active Fleet Assignments & Schedules
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "10px" }}>ROUTE</th>
                <th style={{ padding: "10px" }}>BUS REGISTRATION</th>
                <th style={{ padding: "10px" }}>ASSIGNED DRIVER</th>
                <th style={{ padding: "10px" }}>SHIFT HOURS</th>
                <th style={{ padding: "10px" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 10px", fontWeight: 600 }}>Route {s.route.route_code}: {s.route.name}</td>
                  <td style={{ padding: "12px 10px" }}>{s.bus.license_plate} ({s.bus.model})</td>
                  <td style={{ padding: "12px 10px" }}>{s.driver_name}</td>
                  <td style={{ padding: "12px 10px" }}>{s.start_time} - {s.end_time}</td>
                  <td style={{ padding: "12px 10px" }}>
                    <span style={{ background: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600 }}>
                      On Duty
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default OperatorDashboard;