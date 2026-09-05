const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MongoClient } = require("mongodb");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ===============================
// AUTH ROUTES
// ===============================

app.use("/api/auth", authRoutes);

// ===============================
// MONGODB
// ===============================

const client = new MongoClient(process.env.MONGO_URI, {
  family: 4,
  serverSelectionTimeoutMS: 10000,
});

let db;

// ===============================
// CONNECT TO MONGODB
// ===============================

async function connectDatabase() {
  try {
    await client.connect();

    db = client.db("transitiq");

    // Make database available to routes
    app.locals.db = db;

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
  }
}

// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "TransitIQ Backend is running",
  });
});

// ===============================
// DATABASE TEST ROUTE
// ===============================

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await db.command({
      ping: 1,
    });

    res.json({
      success: true,
      message: "MongoDB is connected",
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ===============================
// START SERVER
// ===============================

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(
      `TransitIQ Backend running on http://localhost:${PORT}`
    );
  });
}

startServer();