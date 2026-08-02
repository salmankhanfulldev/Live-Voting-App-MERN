require("dotenv").config();
const path = require("path"); // 👈 Fixed: Added path module
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const pollRoutes = require("./routes/polls.js");

const connectDB = require("./db.js");
const Poll = require("./models/Polls.js");
const isProduction = process.env.NODE_ENV === "production";

//DB Connection
connectDB();
const app = express();
const httpServer = http.createServer(app); //https is a one way

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

// CORS Dynamic Handler
const corsOriginHandler = (origin, callback) => {
  // Production mein agar same domain se request hai to origin null/undefined hoti hai
  if (!origin || allowedOrigins.includes(origin) || isProduction) {
    callback(null, true);
    return;
  }
  callback(new Error("Not allowed by CORS"));
};

//SOCKET  CORS
const io = new Server(httpServer, {
  // socket is a two way communication between client and server
  cors: {
    origin: corsOriginHandler,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//MIDDLEWARES
app.use(express.json());
app.use(
  cors({
    origin: corsOriginHandler,
    credentials: true,
  }),
);

//REST APIs
app.use("/api/polls", pollRoutes);

if (isProduction) {
  const buildPath = path.join(__dirname, "../client/dist");
  app.use(express.static(buildPath));

  app.get("/{*path}", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({ message: "LivePoll server running in development mode" });
  });
}

//SOCKET.IO EVENTS
io.on("connection", (socket) => {
  console.log(`Client Connected: ${socket.id}`);

  //Join a PollRoom
  socket.on("joinPoll", (pollId) => {
    socket.join(pollId);
    console.log(`Socket ${socket.id} joinRoom : ${pollId}`);
  });

  // Handle Poll Submission by socket
  socket.on("submitVote", async ({ pollId, optionIndex }) => {
    try {
      const poll = await Poll.findById(pollId);
      if (!poll) return;
      if (optionIndex < 0 || optionIndex >= poll.options.length) return;
      poll.options[optionIndex].votes += 1;
      poll.totalVotes += 1;
      await poll.save();

      // Broadcast the updated poll
      io.to(pollId).emit("pollUpdated", poll);
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  });

  //Exit PollRoom
  socket.on("disconnect", () => {
    console.log(`Client Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`LivePoll Server is running ${PORT}`);
});
