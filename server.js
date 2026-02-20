const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Profanity filter
const BAD_WORDS = [
  "fuck", "fucker", "fucking", "fuk",
  "shit", "shithead", "bullshit",
  "bitch", "bastard", "cunt",
  "nigger", "nigga",
  "faggot", "fag",
  "whore", "slut",
  "cock", "dick", "pussy", "ass", "asshole", "arse",
  "motherfucker", "jackass", "dumbass",
  "rape", "porn", "nazi",
];

function containsProfanity(text) {
  const cleaned = text.toLowerCase().replace(/[^a-z]/g, "");
  return BAD_WORDS.some((word) => cleaned.includes(word.replace(/[^a-z]/g, "")));
}

// In-memory state
const state = {
  users: [],
  threshold: 10,
  isDeployed: false,
};

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    // Send current state on connect
    socket.emit("state-sync", state);

    socket.on("join", (data, callback) => {
      if (!data.name || data.name.trim().length === 0) {
        callback({ success: false });
        return;
      }

      if (containsProfanity(data.name)) {
        callback({ success: false });
        return;
      }

      const user = {
        id: socket.id,
        name: data.name.trim().substring(0, 30),
        joinedAt: Date.now(),
      };

      state.users.push(user);

      // Broadcast to all clients
      io.emit("user-joined", user);
      io.emit("state-sync", state);

      callback({ success: true, user });

      // Check deployment threshold
      if (!state.isDeployed && state.users.length >= state.threshold) {
        state.isDeployed = true;
        io.emit("deployment-complete");
      }
    });

    socket.on("set-threshold", (threshold) => {
      const val = parseInt(threshold, 10);
      if (val > 0 && val <= 1000) {
        state.threshold = val;
        io.emit("state-sync", state);

        // Check if we now meet the threshold
        if (!state.isDeployed && state.users.length >= state.threshold) {
          state.isDeployed = true;
          io.emit("deployment-complete");
        }
      }
    });

    socket.on("reset", () => {
      state.users = [];
      state.isDeployed = false;
      io.emit("reset");
      io.emit("state-sync", state);
    });

    socket.on("disconnect", () => {
      // Keep users in list even after disconnect (conference scenario)
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> LiveCluster ready on http://${hostname}:${port}`);
  });
});
