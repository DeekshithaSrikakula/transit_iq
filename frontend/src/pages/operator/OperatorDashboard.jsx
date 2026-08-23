import {
  AlertTriangle,
  BusFront,
  CheckCircle2,
  Clock3,
  MapPin,
  Route,
  Users,
  Wrench,
} from "lucide-react";

function OperatorDashboard() {
  return (
    <div className="operator-dashboard">

      {/* =========================
          NAVBAR
      ========================== */}

      <header className="operator-navbar">

        <a href="/" className="operator-brand">
          <div className="operator-brand-icon">
            <BusFront size={19} />
          </div>

          TransitIQ
        </a>

        <nav className="operator-nav">
          <a href="/operator" className="active">
            Dashboard
          </a>

          <a href="/operator/buses">
            Buses
          </a>

          <a href="/operator/routes">
            Routes
          </a>

          <a href="/operator/drivers">
            Drivers
          </a>

          <a href="/operator/alerts">
            Alerts
          </a>
        </nav>

        <div className="operator-profile">
          <div className="operator-avatar">
            OP
          </div>

          <div>
            <strong>Operator</strong>
            <span>TransitIQ Admin</span>
          </div>
        </div>

      </header>

      {/* =========================
          MAIN
      ========================== */}

      <main className="operator-main">

        {/* Welcome */}

        <section className="operator-welcome">

          <div>
            <span className="operator-eyebrow">
              OPERATIONS DASHBOARD
            </span>

            <h1>
              Hyderabad transit overview.
            </h1>

            <p>
              Monitor buses, routes, drivers, and daily
              operations from one place.
            </p>
          </div>

          <div className="operator-live-status">
            <span></span>
            System operational
          </div>

        </section>

        {/* =========================
            STATISTICS
        ========================== */}

        <section className="operator-stats-grid">

          <div className="operator-stat-card">

            <div className="operator-stat-icon blue">
              <BusFront size={20} />
            </div>

            <div>
              <span>ACTIVE BUSES</span>
              <strong>128</strong>
              <small>+8 today</small>
            </div>

          </div>

          <div className="operator-stat-card">

            <div className="operator-stat-icon purple">
              <Route size={20} />
            </div>

            <div>
              <span>ACTIVE ROUTES</span>
              <strong>42</strong>
              <small>3 updated today</small>
            </div>

          </div>

          <div className="operator-stat-card">

            <div className="operator-stat-icon green">
              <Users size={20} />
            </div>

            <div>
              <span>DRIVERS ON DUTY</span>
              <strong>96</strong>
              <small>4 available</small>
            </div>

          </div>

          <div className="operator-stat-card">

            <div className="operator-stat-icon orange">
              <Wrench size={20} />
            </div>

            <div>
              <span>MAINTENANCE</span>
              <strong>7</strong>
              <small>2 urgent</small>
            </div>

          </div>

        </section>

        {/* =========================
            LIVE FLEET + ACTIVITY
        ========================== */}

        <section className="operator-grid">

          {/* Fleet */}

          <div className="fleet-card">

            <div className="operator-section-heading">

              <div>
                <span>LIVE FLEET</span>
                <h2>Bus activity</h2>
              </div>

              <a href="/operator/buses">
                View all
              </a>

            </div>

            <div className="fleet-list">

              <div className="fleet-row">

                <div className="fleet-bus-icon">
                  <BusFront size={17} />
                </div>

                <div className="fleet-route">
                  <strong>216</strong>
                  <span>Gachibowli → Mehdipatnam</span>
                </div>

                <div className="fleet-driver">
                  <span>Driver</span>
                  <strong>Assigned</strong>
                </div>

                <div className="fleet-status on-time">
                  <span></span>
                  On time
                </div>

              </div>

              <div className="fleet-row">

                <div className="fleet-bus-icon">
                  <BusFront size={17} />
                </div>

                <div className="fleet-route">
                  <strong>47L</strong>
                  <span>HITEC City → Secunderabad</span>
                </div>

                <div className="fleet-driver">
                  <span>Driver</span>
                  <strong>Assigned</strong>
                </div>

                <div className="fleet-status on-time">
                  <span></span>
                  On time
                </div>

              </div>

              <div className="fleet-row">

                <div className="fleet-bus-icon">
                  <BusFront size={17} />
                </div>

                <div className="fleet-route">
                  <strong>127K</strong>
                  <span>Kondapur → Koti</span>
                </div>

                <div className="fleet-driver">
                  <span>Driver</span>
                  <strong>Assigned</strong>
                </div>

                <div className="fleet-status delayed">
                  <span></span>
                  Delayed
                </div>

              </div>

            </div>

          </div>

          {/* System activity */}

          <div className="activity-card">

            <div className="operator-section-heading">

              <div>
                <span>SYSTEM ACTIVITY</span>
                <h2>Recent updates</h2>
              </div>

            </div>

            <div className="activity-list">

              <div className="activity-item">

                <div className="activity-icon green">
                  <CheckCircle2 size={16} />
                </div>

                <div>
                  <strong>Bus 216 started trip</strong>
                  <span>Gachibowli route · 2 min ago</span>
                </div>

              </div>

              <div className="activity-item">

                <div className="activity-icon blue">
                  <Route size={16} />
                </div>

                <div>
                  <strong>Route 47L updated</strong>
                  <span>Schedule changed · 18 min ago</span>
                </div>

              </div>

              <div className="activity-item">

                <div className="activity-icon orange">
                  <Wrench size={16} />
                </div>

                <div>
                  <strong>Bus 128 sent to maintenance</strong>
                  <span>Service required · 32 min ago</span>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =========================
            OPERATIONS
        ========================== */}

        <section className="operator-section">

          <div className="operator-section-heading">

            <div>
              <span>OPERATIONS</span>
              <h2>Today's overview</h2>
            </div>

          </div>

          <div className="operations-card">

            <div className="operation-item">
              <div className="operation-icon">
                <BusFront size={18} />
              </div>

              <div>
                <strong>128</strong>
                <span>Buses operating</span>
              </div>
            </div>

            <div className="operation-item">
              <div className="operation-icon">
                <Route size={18} />
              </div>

              <div>
                <strong>42</strong>
                <span>Routes active</span>
              </div>
            </div>

            <div className="operation-item">
              <div className="operation-icon">
                <Clock3 size={18} />
              </div>

              <div>
                <strong>94%</strong>
                <span>On-time performance</span>
              </div>
            </div>

            <div className="operation-item">
              <div className="operation-icon">
                <Users size={18} />
              </div>

              <div>
                <strong>96</strong>
                <span>Drivers active</span>
              </div>
            </div>

          </div>

        </section>

        {/* =========================
            ALERT
        ========================== */}

        <section className="operator-alert">

          <div className="operator-alert-icon">
            <AlertTriangle size={19} />
          </div>

          <div>
            <strong>2 buses require attention</strong>

            <p>
              Bus 128 is currently under maintenance and
              Bus 305 requires a service inspection.
            </p>
          </div>

          <a href="/operator/buses">
            Review
          </a>

        </section>

      </main>

    </div>
  );
}

export default OperatorDashboard;