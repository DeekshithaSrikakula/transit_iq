import { ArrowRight, MapPin, Search, Bus, Clock, Navigation, Sparkles } from "lucide-react";
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

    const isSouth =
      to.includes("charminar") ||
      to.includes("koti") ||
      to.includes("assembly") ||
      to.includes("khairatabad");
    const isWest =
      to.includes("gachibowli") ||
      to.includes("hitech") ||
      to.includes("madhapur");

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
        type: "Direct Trunk",
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
        type: "IT Express",
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
          type: "Direct Trunk",
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
          type: "IT Express",
        },
      ];
    }

    setSearchResults(matched);
  };

  const handleTrackRoute = (routeId) => {
    // If user not logged in, set default passenger session so they can immediately view the live tracking map
    if (!localStorage.getItem("transitiq_token")) {
      localStorage.setItem("transitiq_token", "demo_passenger");
      localStorage.setItem(
        "transitiq_user",
        JSON.stringify({
          name: "Guest Passenger",
          role: "passenger",
          email: "passenger@test.com",
        })
      );
    }
    navigate("/passenger");
  };

  return (
    <section className="journey-section" id="journey-planner">
      <div className="journey-card">
        <div className="journey-heading">
          <div>
            <span>INTELLIGENT TRANSIT ROUTING</span>
            <h2>Where do you want to travel?</h2>
          </div>

          <p>
            Search real-time bus schedules, direct corridors, and live GPS telemetry
            across Hyderabad.
          </p>
        </div>

        <form onSubmit={handleSearch} className="journey-form">
          <div className="journey-input">
            <MapPin size={22} />
            <div>
              <label>FROM STATION</label>
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
            <Search size={22} />
            <div>
              <label>TO DESTINATION</label>
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
            Search Buses
            <ArrowRight size={18} />
          </button>
        </form>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="location-button"
          >
            <MapPin size={15} color="#06b6d4" />
            <span>Use current location (Secunderabad Stn)</span>
          </button>

          <div
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span>Popular Destinations:</span>
            <button
              type="button"
              onClick={() => {
                setFromLocation("Secunderabad Station");
                setToLocation("Charminar");
                handleSearch();
              }}
              style={{
                background: "rgba(99, 102, 241, 0.12)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "#a5b4fc",
                padding: "4px 10px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Charminar (Old City)
            </button>
            <button
              type="button"
              onClick={() => {
                setFromLocation("Secunderabad Station");
                setToLocation("Gachibowli");
                handleSearch();
              }}
              style={{
                background: "rgba(6, 182, 212, 0.12)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                color: "#67e8f9",
                padding: "4px 10px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Gachibowli IT Corridor
            </button>
          </div>
        </div>

        {/* Live Search Results Container */}
        {searchResults && (
          <div
            style={{
              marginTop: "28px",
              borderTop: "1px solid var(--border-glass)",
              paddingTop: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Sparkles size={18} color="#818cf8" />
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Found {searchResults.length} Direct Transit Options
                </h3>
              </div>
              <div className="beacon-live">
                <span className="beacon-dot"></span>
                <span>Active Live Tracking</span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  searchResults.length > 1
                    ? "repeat(auto-fit, minmax(320px, 1fr))"
                    : "1fr",
                gap: "20px",
              }}
            >
              {searchResults.map((res) => (
                <div
                  key={res.id}
                  className="search-result-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            background:
                              "linear-gradient(135deg, #4f46e5, #06b6d4)",
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: 800,
                            fontFamily: "var(--font-mono)",
                            boxShadow: "0 0 12px rgba(99, 102, 241, 0.4)",
                          }}
                        >
                          Line {res.route_code}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#34d399",
                            background: "rgba(16, 185, 129, 0.12)",
                            border: "1px solid rgba(16, 185, 129, 0.25)",
                            padding: "3px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          {res.status}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "18px",
                            fontWeight: 800,
                            color: "#ffffff",
                          }}
                        >
                          {res.fare}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            fontWeight: 600,
                          }}
                        >
                          EST. FARE
                        </div>
                      </div>
                    </div>

                    <h4
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#f8fafc",
                        lineHeight: 1.3,
                      }}
                    >
                      {res.name}
                    </h4>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "18px",
                      fontSize: "13px",
                      color: "var(--text-body)",
                      padding: "10px 14px",
                      background: "rgba(255, 255, 255, 0.03)",
                      borderRadius: "10px",
                      border: "1px solid var(--border-glass)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Clock size={15} color="#818cf8" />
                      <span>{res.duration}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Bus size={15} color="#34d399" />
                      <span>{res.frequency}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <MapPin size={15} color="#38bdf8" />
                      <span>{res.stopsCount} stops</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTrackRoute(res.id)}
                    className="primary-button"
                    style={{
                      width: "100%",
                      padding: "11px",
                      fontSize: "13px",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Navigation size={15} />
                    Track Corridor on Live Map
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