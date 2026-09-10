const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { WebSocketServer, WebSocket } = require("ws");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "transitiq_super_secret_key_change_later";

app.use(cors());
app.use(express.json());

// ===================================================
// HYDERABAD TRANSIT DATASET (Stops, Routes, Fleet)
// ===================================================
const STOPS = [
  { id: 1, name: "Secunderabad Station", latitude: 17.4344, longitude: 78.5011 },
  { id: 2, name: "Patny Center", latitude: 17.4428, longitude: 78.4988 },
  { id: 3, name: "Paradise", latitude: 17.4435, longitude: 78.4839 },
  { id: 4, name: "Begumpet", latitude: 17.4375, longitude: 78.4482 },
  { id: 5, name: "Ameerpet", latitude: 17.4348, longitude: 78.4483 },
  { id: 6, name: "Panjagutta", latitude: 17.4267, longitude: 78.4533 },
  { id: 7, name: "Khairatabad", latitude: 17.4121, longitude: 78.4611 },
  { id: 8, name: "Assembly", latitude: 17.4042, longitude: 78.4719 },
  { id: 9, name: "Koti", latitude: 17.3828, longitude: 78.4842 },
  { id: 10, name: "Charminar", latitude: 17.3616, longitude: 78.4747 },
  { id: 11, name: "Madhapur", latitude: 17.4483, longitude: 78.3915 },
  { id: 12, name: "Hitech City", latitude: 17.4435, longitude: 78.3772 },
  { id: 13, name: "Gachibowli", latitude: 17.4139, longitude: 78.3498 },
];

const ROUTES = [
  {
    id: 1,
    route_code: "5K",
    name: "Secunderabad Stn to Charminar",
    description: "Core North-South trunk corridor through historic Hyderabad",
    stop_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: 2,
    route_code: "10H",
    name: "Secunderabad Stn to Gachibowli",
    description: "Express commuter corridor linking transit terminals to IT hub",
    stop_ids: [1, 2, 3, 4, 5, 11, 12, 13],
  },
];

let BUSES = [
  { id: 1, license_plate: "TS-09-UA-1234", model: "Volvo 8400 AC", status: "active", latitude: 17.4344, longitude: 78.5011, speed: 38 },
  { id: 2, license_plate: "TS-09-UA-5678", model: "Volvo 8400 AC", status: "active", latitude: 17.4435, longitude: 78.4839, speed: 42 },
  { id: 3, license_plate: "TS-09-UA-9012", model: "Tata LPO 1618", status: "maintenance", latitude: 17.4121, longitude: 78.4611, speed: 0 },
];

let SCHEDULES = [
  {
    id: 1,
    route_id: 1,
    bus_id: 1,
    driver_id: "driver1",
    driver_name: "Mohammad Ali",
    start_time: "08:00",
    end_time: "16:00",
    is_active: true,
    route: ROUTES[0],
    bus: BUSES[0],
  },
  {
    id: 2,
    route_id: 2,
    bus_id: 2,
    driver_id: "driver2",
    driver_name: "Srinivas Rao",
    start_time: "09:00",
    end_time: "17:00",
    is_active: true,
    route: ROUTES[1],
    bus: BUSES[1],
  },
];

let INCIDENTS = [
  {
    id: 1,
    schedule_id: 1,
    driver_id: "driver1",
    driver_name: "Mohammad Ali",
    type: "traffic",
    description: "Heavy congestion near Begumpet flyover",
    status: "reported",
    created_at: new Date().toISOString(),
  },
];

// Local persistent JSON storage for resilient user accounts
const LOCAL_USERS_FILE = path.join(__dirname, "local_users.json");
let fallbackUsers = [];

// Helper to seed or load fallback accounts
async function seedFallbackUsers() {
  const defaultAccounts = [
    { email: "passenger@test.com", password: "password", name: "Deekshitha", role: "passenger" },
    { email: "driver@test.com", password: "password", name: "Mohammad Ali", role: "driver" },
    { email: "operator@test.com", password: "password", name: "Rajesh Kumar", role: "operator" },
    { email: "passenger@transitiq.com", password: "passenger123", name: "Deekshitha", role: "passenger" },
    { email: "driver1@transitiq.com", password: "driver123", name: "Mohammad Ali", role: "driver" },
    { email: "operator@transitiq.com", password: "operator123", name: "Rajesh Kumar", role: "operator" },
  ];

  if (fs.existsSync(LOCAL_USERS_FILE)) {
    try {
      const raw = fs.readFileSync(LOCAL_USERS_FILE, "utf-8");
      fallbackUsers = JSON.parse(raw);
    } catch (e) {
      console.warn("Could not read local_users.json, initializing fresh pool:", e.message);
    }
  }

  // Ensure default demo accounts exist
  for (const acc of defaultAccounts) {
    if (!fallbackUsers.some((u) => u.email.toLowerCase() === acc.email.toLowerCase())) {
      const hash = await bcrypt.hash(acc.password, 10);
      fallbackUsers.push({
        _id: acc.email,
        email: acc.email.toLowerCase(),
        name: acc.name,
        password: hash,
        role: acc.role,
        createdAt: new Date(),
      });
    }
  }

  try {
    fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(fallbackUsers, null, 2));
  } catch (err) {
    console.error("Could not write local_users.json:", err);
  }
}
seedFallbackUsers();

// ===================================================
// DATABASE CONNECTION (Mongo Atlas with Auto Fallback)
// ===================================================
let mongoDbInstance = null;
let useFallbackDb = true;

async function initDatabase() {
  if (!process.env.MONGO_URI) {
    console.log("No MONGO_URI specified. Operating in Local Resilient Mode.");
    useFallbackDb = true;
    return;
  }

  try {
    const client = new MongoClient(process.env.MONGO_URI, {
      family: 4,
      serverSelectionTimeoutMS: 3000,
    });
    await client.connect();
    mongoDbInstance = client.db("transitiq");
    useFallbackDb = false;
    console.log("MongoDB Atlas connected successfully.");
  } catch (error) {
    console.warn("MongoDB Atlas connection unavailable:", error.message);
    console.log("Automatically activating Local Resilient Storage. Sign-ins and APIs remain 100% operational.");
    useFallbackDb = true;
  }
}

// Database user abstraction with persistent fallback
const dbService = {
  async findUser(email, role) {
    if (!useFallbackDb && mongoDbInstance) {
      const query = { email: email.toLowerCase() };
      if (role) query.role = role;
      return await mongoDbInstance.collection("users").findOne(query);
    }
    return fallbackUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && (!role || u.role === role)
    );
  },

  async createUser(userData) {
    if (!useFallbackDb && mongoDbInstance) {
      const res = await mongoDbInstance.collection("users").insertOne(userData);
      return res.insertedId;
    }
    userData._id = Date.now().toString();
    fallbackUsers.push(userData);
    try {
      fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(fallbackUsers, null, 2));
    } catch (err) {
      console.error("Could not write to local_users.json:", err);
    }
    return userData._id;
  },
};

// ===================================================
// AUTH ROUTES (/api/auth)
// ===================================================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role = "passenger" } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password required" });
    }

    const existing = await dbService.findUser(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { name, email: email.toLowerCase(), password: hashedPassword, role, createdAt: new Date() };
    const userId = await dbService.createUser(user);

    return res.status(201).json({ success: true, message: "Registration successful", userId });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Lookup user by email
    const user = await dbService.findUser(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: `No account registered with email "${email}". Please register your credentials first.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please verify your credentials and try again.",
      });
    }

    // Resolve user role
    const effectiveRole = user.role || role || "passenger";

    const token = jwt.sign(
      { userId: user._id.toString(), role: effectiveRole, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: effectiveRole },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// Also support OAuth2 urlencoded login for Swagger or dual compatibility
app.post("/api/v1/auth/login", express.urlencoded({ extended: true }), async (req, res) => {
  const username = req.body.username || req.body.email;
  const password = req.body.password;
  const user = await dbService.findUser(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ detail: "Incorrect credentials" });
  }
  const token = jwt.sign({ sub: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({ access_token: token, token_type: "bearer" });
});

// ===================================================
// TRANSIT REST APIs (/api & /api/v1)
// ===================================================
const transitRouter = express.Router();

// Stops
transitRouter.get("/stops", (req, res) => res.json(STOPS));

// Routes
transitRouter.get("/routes", (req, res) => res.json(ROUTES));
transitRouter.get("/routes/:id", (req, res) => {
  const route = ROUTES.find((r) => r.id === parseInt(req.params.id));
  if (!route) return res.status(404).json({ message: "Route not found" });

  const stop_associations = route.stop_ids.map((stopId, idx) => ({
    id: idx + 1,
    route_id: route.id,
    stop_id: stopId,
    sequence: idx,
    stop: STOPS.find((s) => s.id === stopId),
  }));

  return res.json({ ...route, stop_associations });
});

// Buses
transitRouter.get("/buses", (req, res) => res.json(BUSES));

// Schedules
transitRouter.get("/schedules", (req, res) => res.json(SCHEDULES));

// Incidents
transitRouter.get("/incidents", (req, res) => res.json(INCIDENTS));
transitRouter.post("/incidents", (req, res) => {
  const { schedule_id, type, description } = req.body;
  const newIncident = {
    id: INCIDENTS.length + 1,
    schedule_id: schedule_id || 1,
    driver_id: "driver1",
    driver_name: "Mohammad Ali",
    type: type || "traffic",
    description: description || "Route delay reported",
    status: "reported",
    created_at: new Date().toISOString(),
  };
  INCIDENTS.unshift(newIncident);
  res.status(201).json(newIncident);
});

transitRouter.patch("/incidents/:id", (req, res) => {
  const incident = INCIDENTS.find((i) => i.id === parseInt(req.params.id));
  if (!incident) return res.status(404).json({ message: "Incident not found" });
  if (req.body.status) incident.status = req.body.status;
  res.json(incident);
});

// Live locations
transitRouter.get("/tracking/live-locations", (req, res) => {
  res.json(
    BUSES.map((b) => ({
      bus_id: b.id,
      license_plate: b.license_plate,
      latitude: b.latitude,
      longitude: b.longitude,
      speed: b.speed,
      status: b.status,
    }))
  );
});

app.use("/api", transitRouter);
app.use("/api/v1", transitRouter);

// System health
app.get("/health", (req, res) => {
  res.json({
    status: "online",
    database: useFallbackDb ? "local_resilient" : "mongodb_atlas",
    port: PORT,
  });
});

app.get("/", (req, res) => {
  res.json({ message: "TransitIQ Server is running", live_radar: "/api/tracking/live-locations" });
});

// ===================================================
// ===================================================
// CREATE HTTP & WEBSOCKET SERVER
// ===================================================
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

const subscribers = new Set();
const manuallyControlledBuses = new Set();

wss.on("connection", (ws, request) => {
  const url = request.url;
  const isDriver = url.includes("/ws/driver");
  const busIdMatch = url.match(/\/ws\/driver\/(\d+)/);
  const busId = busIdMatch ? parseInt(busIdMatch[1]) : 1;

  if (!isDriver) {
    subscribers.add(ws);
    // Send immediate initial bus positions
    BUSES.forEach((bus) => {
      ws.send(JSON.stringify({ bus_id: bus.id, license_plate: bus.license_plate, latitude: bus.latitude, longitude: bus.longitude, speed: bus.speed, route_id: bus.route_id || 1, status: bus.status }));
    });
  } else {
    manuallyControlledBuses.add(busId);
  }

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw);
      // Update in-memory bus position
      const bus = BUSES.find((b) => b.id === (data.bus_id || busId));
      if (bus) {
        bus.latitude = data.latitude;
        bus.longitude = data.longitude;
        bus.speed = data.speed || 35;
        bus.status = "active";
        bus.route_id = data.route_id || bus.route_id || 1;
      }

      // Broadcast to all connected passenger and operator sockets
      const broadcastPayload = JSON.stringify({
        bus_id: data.bus_id || busId,
        license_plate: bus ? bus.license_plate : `Bus ${busId}`,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed || 35,
        route_id: data.route_id || 1,
        status: "active",
      });

      for (const client of subscribers) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(broadcastPayload);
        }
      }
    } catch (err) {
      console.error("WS message parse error:", err);
    }
  });

  ws.on("close", () => {
    if (isDriver) {
      manuallyControlledBuses.delete(busId);
    } else {
      subscribers.delete(ws);
    }
  });
});

// ===================================================
// CONTINUOUS FLEET TELEMETRY SIMULATION
// ===================================================
const busSimulationState = {
  1: { stopIndex: 0, stepRatio: 0.1, routeId: 1 },
  2: { stopIndex: 2, stepRatio: 0.4, routeId: 2 },
  3: { stopIndex: 5, stepRatio: 0.7, routeId: 1 },
};

setInterval(() => {
  [1, 2, 3].forEach((busId) => {
    if (manuallyControlledBuses.has(busId)) return;

    const sim = busSimulationState[busId];
    if (!sim) return;

    const route = ROUTES.find((r) => r.id === sim.routeId);
    if (!route || !route.stop_ids) return;

    const stopList = route.stop_ids.map((id) => STOPS.find((s) => s.id === id)).filter(Boolean);
    if (stopList.length < 2) return;

    sim.stepRatio += 0.04;
    if (sim.stepRatio >= 1.0) {
      sim.stepRatio = 0;
      sim.stopIndex = (sim.stopIndex + 1) % stopList.length;
    }

    const p1 = stopList[sim.stopIndex];
    const p2 = stopList[(sim.stopIndex + 1) % stopList.length];

    const lat = p1.latitude + (p2.latitude - p1.latitude) * sim.stepRatio;
    const lng = p1.longitude + (p2.longitude - p1.longitude) * sim.stepRatio;
    const simSpeed = Math.floor(34 + Math.sin(Date.now() / 4000) * 10);

    const bus = BUSES.find((b) => b.id === busId);
    if (bus) {
      bus.latitude = lat;
      bus.longitude = lng;
      bus.speed = simSpeed;
      bus.status = "active";
      bus.route_id = sim.routeId;
    }

    const payload = JSON.stringify({
      bus_id: busId,
      license_plate: bus ? bus.license_plate : `TS-09-UA-${1000 + busId}`,
      latitude: lat,
      longitude: lng,
      speed: simSpeed,
      route_id: sim.routeId,
      status: "active",
    });

    for (const client of subscribers) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  });
}, 2000);

server.on("upgrade", (request, socket, head) => {
  if (request.url.includes("/tracking/ws") || request.url.includes("/ws/")) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Start Server
async function start() {
  await initDatabase();
  server.listen(PORT, () => {
    console.log(`TransitIQ Unified Server running on http://localhost:${PORT}`);
  });
}

start();