import { ArrowRight, MapPin, Search, Bus, Clock, Navigation } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HYDERABAD_STOPS = [
  "Secunderabad Station",
  "Patny Center",
  "Paradise",
  "Begumpet",
  "Ameerpet",
  "Panjagutta",
  "Khairatabad",
  "Assembly",
  "Koti",
  "Charminar",
  "Madhapur",
  "Hitech City",
  "Gachibowli",
];

function SearchBox() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const navigate = useNavigate();

  const handleUseCurrentLocation = () => {
    setFromLocation("Secunderabad Station");
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();

    const from = fromLocation.toLowerCase();
    const to = toLocation.toLowerCase();

    // Determine matching routes based on query
    let matched = [];

    const isSouth = to.includes("charminar") || to.includes("koti") || to.includes("assembly") || to.includes("khairatabad");
    const isWest = to.includes("gachibowli") || to.includes("hitech") || to.includes("madhapur");

    if (isSouth) {
      matched.push({
        id: 1,
        route_code: "5K",
        name: "Secunderabad Station to Charminar",
        duration: "45 mins",
        frequency: "Every 8 mins",
        fare: "₹25",
        status: "High Frequency",
        stopsCount: 10,
      });
    } else if (isWest) {
      matched.push({
        id: 2,
        route_code: "10H",
        name: "Secunderabad Station to Gachibowli IT Corridor",
        duration: "55 mins",
        frequency: "Every 10 mins",
        fare: "₹35",
        status: "Express AC",
        stopsCount: 8,
      });
    } else {
      // Default both routes
      matched = [
        {
          id: 1,
          route_code: "5K",
          name: "Secunderabad Station to Charminar",
          duration: "45 mins",
          frequency: "Every 8 mins",
          fare: "₹25",
          status: "High Frequency",
          stopsCount: 10,
        },
        {
          id: 2,
          route_code: "10H",
          name: "Secunderabad Station to Gachibowli IT Corridor",
          duration: "55 mins",
          frequency: "Every 10 mins",
          fare: "₹35",
          status: "Express AC",
          stopsCount: 8,
        },
      ];
    }

    setSearchResults(matched);
  };

  const handleTrackRoute = (routeId) => {
    // If user not logged in, set default guest session so they can view the dashboard
    if (!localStorage.getItem("transitiq_token")) {
      localStorage.setItem("transitiq_token", "guest_token");
      localStorage.setItem(
        "transitiq_user",
        JSON.stringify({ name: "Guest Passenger", role: "passenger", email: "guest@transitiq.com" })
      );
    }
    navigate("/passenger");
  };

  return (
    <section className="journey-section" id="journey-planner">
      <div className="journey-card">
        <div className="journey-heading">
          <div>
            <span>PLAN YOUR JOURNEY</span>
            <h2>Where do you want to go?</h2>
          </div>

          <p>
            Find the best bus routes across Hyderabad and get real-time
            information for your journey.
          </p>
        </div>

        <form onSubmit={handleSearch} className="journey-form">
          <div className="journey-input">
            <MapPin size={20} />
            <div>
              <label>FROM</label>
              <input
                type="text"
                list="stops-list"
                placeholder="Starting stop (e.g. Secunderabad)"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="journey-divider"></div>

          <div className="journey-input">
            <Search size={20} />
            <div>
              <label>TO</label>
              <input
                type="text"
                list="stops-list"
                placeholder="Destination (e.g. Charminar, Gachibowli)"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
              />
            </div>
          </div>

          <datalist id="stops-list">
            {HYDERABAD_STOPS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>

          <button type="submit" className="journey-button">
            Search buses
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="location-button"
            style={{ cursor: "pointer" }}
          >
            <MapPin size={16} />
            Use my current location (Secunderabad)
          </button>

          <div style={{ fontSize: "12px", color: "#64748b" }}>
            Popular: <span style={{ textDecoration: "underline", cursor: "pointer", marginRight: 8 }} onClick={() => { setFromLocation("Secunderabad Station"); setToLocation("Charminar"); handleSearch(); }}>Charminar</span>
            <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => { setFromLocation("Secunderabad Station"); setToLocation("Gachibowli"); handleSearch(); }}>Gachibowli IT</span>
          </div>
        </div>

        {/* Live Search Results Container */}
        {searchResults && (
          <div style={{ marginTop: "24px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                Found {searchResults.length} Direct Transit Options
              </h3>
              <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>
                ● Live Fleet Active
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: searchResults.length > 1 ? "1fr 1fr" : "1fr", gap: "16px" }}>
              {searchResults.map((res) => (
                <div
                  key={res.id}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ background: "#2563eb", color: "white", padding: "3px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: 700 }}>
                          Route {res.route_code}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#475569", background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px" }}>
                          {res.status}
                        </span>
                      </div>
                      <h4 style={{ fontSize: "14px", fontWeight: 700, marginTop: "6px", color: "#1e293b" }}>
                        {res.name}
                      </h4>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>{res.fare}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>approx. fare</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#475569" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={13} color="#2563eb" /> {res.duration}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Bus size={13} color="#16a34a" /> {res.frequency}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={13} color="#ea580c" /> {res.stopsCount} stops
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTrackRoute(res.id)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#2563eb",
                      color: "white",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Navigation size={14} /> Track Live On Map
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default SearchBox;