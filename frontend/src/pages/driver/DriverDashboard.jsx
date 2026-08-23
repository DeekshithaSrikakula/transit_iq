import {
  AlertTriangle,
  BusFront,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Play,
  Route,
  Square,
} from "lucide-react";
import { useState } from "react";

function DriverDashboard() {
  const [tripActive, setTripActive] = useState(false);

  return (
    <div className="driver-dashboard">

      {/* =========================
          NAVBAR
      ========================== */}

      <header className="driver-navbar">
        <a href="/" className="driver-brand">
          <div className="driver-brand-icon">
            <BusFront size={19} />
          </div>

          TransitIQ
        </a>

        <nav className="driver-nav-links">
          <a href="/driver" className="active">
            Dashboard
          </a>

          <a href="/driver/trips">
            My trips
          </a>

          <a href="/driver/routes">
            Route
          </a>

          <a href="/driver/alerts">
            Alerts
          </a>
        </nav>

        <div className="driver-profile">
          <div className="driver-avatar">
            DR
          </div>

          <div>
            <strong>Driver</strong>
            <span>TransitIQ Driver</span>
          </div>
        </div>
      </header>

      {/* =========================
          MAIN
      ========================== */}

      <main className="driver-main">

        {/* Welcome */}

        <section className="driver-welcome">

          <div>
            <span className="driver-eyebrow">
              DRIVER DASHBOARD
            </span>

            <h1>
              Good morning, Driver.
            </h1>

            <p>
              Here's everything you need for today's service.
            </p>
          </div>

          <div className="driver-status">
            <span></span>
            {tripActive ? "Trip in progress" : "Ready for service"}
          </div>

        </section>

        {/* =========================
            ASSIGNED BUS
        ========================== */}

        <section className="driver-overview-grid">

          <div className="assigned-bus-card">

            <div className="driver-card-heading">
              <div>
                <span>ASSIGNED VEHICLE</span>
                <h2>Bus 216</h2>
              </div>

              <div className="vehicle-status">
                <span></span>
                Available
              </div>
            </div>

            <div className="bus-details">

              <div>
                <span>Route</span>
                <strong>216 · Gachibowli</strong>
              </div>

              <div>
                <span>Destination</span>
                <strong>Mehdipatnam</strong>
              </div>

              <div>
                <span>Vehicle ID</span>
                <strong>TS-09-216</strong>
              </div>

            </div>

            <div className="trip-control">

              {!tripActive ? (
                <button
                  className="start-trip-button"
                  onClick={() => setTripActive(true)}
                >
                  <Play size={17} />
                  Start trip
                </button>
              ) : (
                <button
                  className="stop-trip-button"
                  onClick={() => setTripActive(false)}
                >
                  <Square size={16} />
                  End trip
                </button>
              )}

            </div>

          </div>

          {/* Location */}

          <div className="driver-location-card">

            <div className="driver-card-heading">
              <div>
                <span>LOCATION</span>
                <h2>GPS Status</h2>
              </div>

              <Navigation size={20} />
            </div>

            <div className="gps-status">
              <div className="gps-icon">
                <MapPin size={21} />
              </div>

              <div>
                <strong>Location active</strong>
                <span>Updating every few seconds</span>
              </div>
            </div>

            <div className="location-info">
              <span>Current area</span>
              <strong>Gachibowli, Hyderabad</strong>
            </div>

          </div>

        </section>

        {/* =========================
            TRIP PROGRESS
        ========================== */}

        <section className="driver-section">

          <div className="driver-section-heading">
            <div>
              <span>CURRENT TRIP</span>
              <h2>Route progress</h2>
            </div>

            <div className="route-number">
              <Route size={15} />
              216
            </div>
          </div>

          <div className="route-progress-card">

            <div className="progress-top">

              <div>
                <span>START</span>
                <strong>Gachibowli</strong>
              </div>

              <div className="progress-line">
                <div className="progress-fill"></div>
                <div className="progress-bus">
                  <BusFront size={15} />
                </div>
              </div>

              <div className="progress-destination">
                <span>DESTINATION</span>
                <strong>Mehdipatnam</strong>
              </div>

            </div>

            <div className="next-stop">

              <div className="next-stop-icon">
                <MapPin size={18} />
              </div>

              <div>
                <span>NEXT STOP</span>
                <strong>HITEC City</strong>
              </div>

              <div className="next-stop-time">
                <Clock3 size={15} />
                <strong>4 min</strong>
              </div>

            </div>

          </div>

        </section>

        {/* =========================
            TODAY'S TRIPS
        ========================== */}

        <section className="driver-section">

          <div className="driver-section-heading">
            <div>
              <span>TODAY</span>
              <h2>Your trips</h2>
            </div>

            <a href="/driver/trips">
              View schedule
            </a>
          </div>

          <div className="driver-trips">

            <div className="driver-trip completed">

              <div className="trip-time">
                <strong>07:30</strong>
                <span>AM</span>
              </div>

              <div className="trip-route">
                <strong>Gachibowli → Mehdipatnam</strong>
                <span>Route 216 · Completed</span>
              </div>

              <div className="trip-status">
                <CheckCircle2 size={17} />
                Completed
              </div>

            </div>

            <div className="driver-trip active-trip">

              <div className="trip-time">
                <strong>10:15</strong>
                <span>AM</span>
              </div>

              <div className="trip-route">
                <strong>Gachibowli → Mehdipatnam</strong>
                <span>Route 216 · Upcoming</span>
              </div>

              <div className="trip-status upcoming">
                <Clock3 size={17} />
                Upcoming
              </div>

            </div>

            <div className="driver-trip">

              <div className="trip-time">
                <strong>01:30</strong>
                <span>PM</span>
              </div>

              <div className="trip-route">
                <strong>Mehdipatnam → Gachibowli</strong>
                <span>Route 216 · Scheduled</span>
              </div>

              <div className="trip-status upcoming">
                <Clock3 size={17} />
                Scheduled
              </div>

            </div>

          </div>

        </section>

        {/* =========================
            ALERT
        ========================== */}

        <section className="driver-alert">

          <div className="alert-icon">
            <AlertTriangle size={19} />
          </div>

          <div>
            <strong>Service information</strong>

            <p>
              Expect moderate traffic around HITEC City
              during the morning peak.
            </p>
          </div>

        </section>

      </main>
    </div>
  );
}

export default DriverDashboard;