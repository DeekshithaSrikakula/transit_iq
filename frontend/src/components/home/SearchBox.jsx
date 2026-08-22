import { ArrowRight, MapPin, Search } from "lucide-react";

function SearchBox() {
  return (
    <section className="journey-section">
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

        <div className="journey-form">

          <div className="journey-input">
            <MapPin size={20} />

            <div>
              <label>FROM</label>
              <input
                type="text"
                placeholder="Current location or starting point"
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
                placeholder="Where do you want to go?"
              />
            </div>
          </div>

          <button className="journey-button">
            Search buses
            <ArrowRight size={18} />
          </button>

        </div>

        <button className="location-button">
          <MapPin size={16} />
          Use my current location
        </button>

      </div>
    </section>
  );
}

export default SearchBox;