import { ArrowRight, MapPin, Navigation, Search } from "lucide-react";
import Navbar from "../../components/navigation/Navbar";
import SearchBox from "../../components/home/SearchBox";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="status-dot"></span>
              Live transit for Hyderabad
            </div>

            <h1>
              Move smarter.
              <br />
              <span>Travel better.</span>
            </h1>

            <p className="hero-description">
              Find nearby buses, discover the best routes, and track your
              journey in real time with TransitIQ.
            </p>

            <div className="hero-actions">
              <button className="primary-button">
                Plan your journey
                <ArrowRight size={18} />
              </button>

              <button className="secondary-button">
                <Navigation size={18} />
                Explore live buses
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="map-card">
              <div className="map-header">
                <div>
                  <span className="map-label">LIVE NETWORK</span>
                  <h3>Hyderabad Transit</h3>
                </div>

                <div className="live-indicator">
                  <span></span>
                  Live
                </div>
              </div>

              <div className="map-area">
                <div className="route-line route-one"></div>
                <div className="route-line route-two"></div>

                <div className="map-stop stop-one"></div>
                <div className="map-stop stop-two"></div>
                <div className="map-stop stop-three"></div>

                <div className="bus-marker bus-one">🚌</div>
                <div className="bus-marker bus-two">🚌</div>

                <div className="map-location">
                  <MapPin size={18} />
                  <span>You are here</span>
                </div>
              </div>

              <div className="map-footer">
                <div>
                  <strong>128</strong>
                  <span>Active buses</span>
                </div>

                <div>
                  <strong>42</strong>
                  <span>Routes</span>
                </div>

                <div>
                  <strong>1,240+</strong>
                  <span>Stops</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SearchBox />

        <section className="features-section">
          <section className="how-it-works">
  <div className="section-heading">
    <span>HOW TRANSITIQ WORKS</span>
    <h2>Your journey, made simple.</h2>
  </div>

  <div className="steps-grid">
    <div className="step-card">
      <div className="step-number">01</div>
      <h3>Search</h3>
      <p>
        Enter where you are and where you want to go.
      </p>
    </div>

    <div className="step-card">
      <div className="step-number">02</div>
      <h3>Choose a route</h3>
      <p>
        Compare available buses and choose the route that works best for you.
      </p>
    </div>

    <div className="step-card">
      <div className="step-number">03</div>
      <h3>Track your bus</h3>
      <p>
        Follow your bus in real time and see its expected arrival.
      </p>
    </div>

    <div className="step-card">
      <div className="step-number">04</div>
      <h3>Reach your destination</h3>
      <p>
        Travel confidently with live updates throughout your journey.
      </p>
    </div>
  </div>
</section>
          <div className="section-heading">
            <span>WHY TRANSITIQ</span>
            <h2>Everything you need for a better journey.</h2>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Navigation size={22} />
              </div>
              <h3>Live Bus Tracking</h3>
              <p>
                See buses moving in real time and know exactly where your bus
                is.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Search size={22} />
              </div>
              <h3>Smart Route Search</h3>
              <p>
                Find convenient routes between your starting point and
                destination.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <MapPin size={22} />
              </div>
              <h3>Accurate ETA</h3>
              <p>
                Know when your bus will arrive and plan your journey with
                confidence.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;