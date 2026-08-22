import {
  BusFront,
  Clock3,
  MapPin,
  Navigation,
  Search,
  Star,
  Ticket,
} from "lucide-react";

function PassengerDashboard() {
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
          <a href="/passenger/routes">Routes</a>
          <a href="/passenger/live">Live buses</a>
          <a href="/passenger/saved">Saved</a>
        </nav>

        <div className="dashboard-profile">
          <div className="profile-avatar">DS</div>

          <div>
            <strong>Deekshitha</strong>
            <span>Passenger</span>
          </div>
        </div>
      </header>

      <main className="dashboard-main">

        {/* Welcome */}

        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-eyebrow">
              PASSENGER DASHBOARD
            </span>

            <h1>
              Where are you going today?
            </h1>

            <p>
              Find a route, track your bus, or explore Hyderabad.
            </p>
          </div>

          <div className="dashboard-location">
            <MapPin size={17} />
            Hyderabad
          </div>
        </section>

        {/* Journey Search */}

        <section className="dashboard-search-card">
          <div className="dashboard-search-heading">
            <div>
              <span>PLAN YOUR JOURNEY</span>
              <h2>Find your bus</h2>
            </div>

            <button>
              <Navigation size={16} />
              Use current location
            </button>
          </div>

          <div className="dashboard-search-form">

            <div className="dashboard-search-input">
              <MapPin size={19} />

              <div>
                <label>FROM</label>
                <input
                  type="text"
                  placeholder="Your starting point"
                />
              </div>
            </div>

            <div className="dashboard-search-input">
              <MapPin size={19} />

              <div>
                <label>TO</label>
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                />
              </div>
            </div>

            <button className="dashboard-search-button">
              <Search size={18} />
              Find buses
            </button>

          </div>
        </section>

        {/* Quick Actions */}

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span>QUICK ACCESS</span>
              <h2>Get moving faster</h2>
            </div>
          </div>

          <div className="quick-action-grid">

            <a href="/passenger/live" className="quick-action-card">
              <div className="quick-action-icon">
                <Navigation size={21} />
              </div>

              <div>
                <h3>Live buses</h3>
                <p>
                  See buses currently moving around you.
                </p>
              </div>
            </a>

            <a href="/passenger/routes" className="quick-action-card">
              <div className="quick-action-icon">
                <Ticket size={21} />
              </div>

              <div>
                <h3>Explore routes</h3>
                <p>
                  Discover routes across Hyderabad.
                </p>
              </div>
            </a>

            <a href="/passenger/saved" className="quick-action-card">
              <div className="quick-action-icon">
                <Star size={21} />
              </div>

              <div>
                <h3>Saved journeys</h3>
                <p>
                  Quickly access your favourite routes.
                </p>
              </div>
            </a>

          </div>
        </section>

        {/* Nearby Buses */}

        <section className="dashboard-section">

          <div className="dashboard-section-heading">
            <div>
              <span>NEARBY</span>
              <h2>Buses near you</h2>
            </div>

            <a href="/passenger/live">
              View all
            </a>
          </div>

          <div className="bus-list">

            <div className="bus-card">
              <div className="bus-number">
                <BusFront size={19} />
                <strong>216</strong>
              </div>

              <div className="bus-route">
                <strong>Gachibowli</strong>
                <span>→ Mehdipatnam</span>
              </div>

              <div className="bus-eta">
                <strong>5 min</strong>
                <span>1.2 km away</span>
              </div>

              <div className="bus-status">
                <span></span>
                On time
              </div>
            </div>

            <div className="bus-card">
              <div className="bus-number">
                <BusFront size={19} />
                <strong>47L</strong>
              </div>

              <div className="bus-route">
                <strong>HITEC City</strong>
                <span>→ Secunderabad</span>
              </div>

              <div className="bus-eta">
                <strong>9 min</strong>
                <span>2.4 km away</span>
              </div>

              <div className="bus-status">
                <span></span>
                On time
              </div>
            </div>

            <div className="bus-card">
              <div className="bus-number">
                <BusFront size={19} />
                <strong>127K</strong>
              </div>

              <div className="bus-route">
                <strong>Kondapur</strong>
                <span>→ Koti</span>
              </div>

              <div className="bus-eta">
                <strong>14 min</strong>
                <span>3.1 km away</span>
              </div>

              <div className="bus-status delayed">
                <span></span>
                Delayed
              </div>
            </div>

          </div>
        </section>

        {/* Recent Journey */}

        <section className="dashboard-section">

          <div className="dashboard-section-heading">
            <div>
              <span>YOUR ACTIVITY</span>
              <h2>Recent journey</h2>
            </div>
          </div>

          <div className="recent-journey-card">
            <div className="recent-icon">
              <Clock3 size={21} />
            </div>

            <div className="recent-route">
              <strong>Gachibowli → HITEC City</strong>
              <span>Yesterday · Bus 216</span>
            </div>

            <a href="/passenger/routes">
              Plan again
            </a>
          </div>

        </section>

      </main>
    </div>
  );
}

export default PassengerDashboard;