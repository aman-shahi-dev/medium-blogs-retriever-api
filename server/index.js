import dotenv from "dotenv";
// Load env variables at the absolute top of the entry file
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/dbConnection.js";
import postsRouter from "./routes/posts.js";
import { syncAllUsers } from "./services/mediumService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Apply middle wares
app.use(cors());
app.use(express.json());

// Lightweight health check endpoint for external pingers (keep-awake cron)
app.get("/api/ping", (req, res) => {
  res.json({ status: "alive" });
});

// Mount the API routes first
app.use("/api", postsRouter);

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder (serving compiled React build from client/dist)
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // Any route that doesn't match an API route will serve the React frontend index.html
  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "dist", "index.html"));
  });
} else {
  // API documentation landing page (Local development placeholder)
  app.get("/", (req, res) => {
    res.json({
      message: "Welcome to the Medium Blogs Retriever API 🚀",
      description: "A developer-friendly API to fetch and cache all posts from any Medium user.",
      endpoints: {
        "GET /api/posts/:username": "Fetch all blog posts for a specific Medium user.",
      },
      usage: `Example: GET http://localhost:${PORT}/api/posts/amanshahidev`,
      note: "First request for a new username triggers a full profile scrape using Puppeteer (may take 30s-1min). Subsequent requests are served instantly from cache or MongoDB.",
    });
  });
}

// Function to start the background syncing interval task
function startBackgroundSync() {
  console.log(
    "⏰ Initializing background sync scheduler (Interval: 30 minutes)...",
  );

  // Run background sync every 30 minutes
  setInterval(
    async () => {
      try {
        await syncAllUsers();
      } catch (error) {
        console.error("Background sync interval failed:", error.message);
      }
    },
    30 * 60 * 1000,
  );
}

// Connect to MongoDB and then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server successfully running on port ${PORT}`);

    // Start background syncing cycle
    startBackgroundSync();
  });
});
