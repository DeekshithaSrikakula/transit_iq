import Navbar from "./components/navigation/Navbar";

function App() {
  return (
    <>
      <Navbar />

      <main>
        <h1>TransitIQ 🚍</h1>
        <h2>Smart Transit for Hyderabad</h2>

        <p>
          Find buses, track them live, and plan your journey easily.
        </p>

        <button>Find Buses</button>
      </main>
    </>
  );
}

export default App;