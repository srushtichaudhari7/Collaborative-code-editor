const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins, configure for production
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;
let users = [];

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins a room
  socket.on("join-room", (username) => {
    users.push({ id: socket.id, name: username });
    console.log(`${username} joined the room.`);
    io.emit("user-joined", username);
    socket.emit("update-users", users.map((user) => user.name));
  });

  // Handle code changes
  socket.on("code-change", (code) => {
    socket.broadcast.emit("code-change", code);
  });

  // Handle chat messages
  socket.on("send-message", (message) => {
    io.emit("receive-message", message); // Broadcast to all users
  });

  // User leaves the room
  socket.on("disconnect", () => {
    const user = users.find((u) => u.id === socket.id);
    if (user) {
      users = users.filter((u) => u.id !== socket.id);
      io.emit("user-left", user.name);
      console.log(`${user.name} left the room.`);
    }
  });

  socket.on("leave-room", () => {
    const user = users.find((u) => u.id === socket.id);
    if (user) {
      users = users.filter((u) => u.id !== socket.id);
      io.emit("user-left", user.name);
    }
  });
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Collaborative Code Editor Backend is running...");
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
