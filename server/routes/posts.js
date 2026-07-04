import express from "express";
import NodeCache from "node-cache";
import {
  getPostsByUsername,
  fetchPostsForNewUser,
  syncNewPostsViaRSS,
} from "../services/mediumService.js";

const router = express.Router();

// Initialize cache with a 10-minute Time-To-Live (stdTTL: 600 seconds)
const cache = new NodeCache({ stdTTL: 600 });

/**
 * GET /api/posts/:username
 * Fetches all Medium posts for the specified username
 */
router.get("/posts/:username", async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username parameter is required",
    });
  }

  const normalizedUsername = username.replace(/^@/, "").toLowerCase();
  const cacheKey = `posts_${normalizedUsername}`;

  try {
    // 1. Check in-memory cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`⚡ Cache HIT for @${normalizedUsername}`);
      if (cachedData.success === false) {
        return res.status(cachedData.status || 404).json(cachedData);
      }
      return res.json(cachedData);
    }

    // 2. Check MongoDB
    let posts = await getPostsByUsername(normalizedUsername);

    // 3. Handle First-Time User (No posts in DB)
    if (posts.length === 0) {
      console.log(
        `🔍 First time request for @${normalizedUsername}. Running Puppeteer...`,
      );

      const count = await fetchPostsForNewUser(normalizedUsername);
      if (count === 0) {
        const errorResponse = {
          success: false,
          status: 404,
          message: `No posts found for user @${normalizedUsername} or user does not exist.`,
        };
        // Cache the empty state to prevent subsequent Puppeteer scrapers
        cache.set(cacheKey, errorResponse);
        return res.status(404).json(errorResponse);
      }

      // Immediately run the RSS sync to enrich the scraped articles with dates, tags, and excerpts
      try {
        console.log(`📡 Enriching scraped posts with RSS data for @${normalizedUsername}...`);
        await syncNewPostsViaRSS(normalizedUsername);
      } catch (rssErr) {
        console.warn(`Warning: RSS enrichment failed for @${normalizedUsername}:`, rssErr.message);
      }

      // Get the newly scraped and enriched posts from DB
      posts = await getPostsByUsername(normalizedUsername);
    } else {
      // 4. Handle Returning User (Posts in DB)
      // Fire the RSS sync in the background to catch any new posts silently.
      // Notice we do NOT use "await" here — the response is sent immediately.
      console.log(
        `📦 Serving @${normalizedUsername} from DB. Background sync triggered.`,
      );
      syncNewPostsViaRSS(normalizedUsername).catch((err) =>
        console.error(
          `Background RSS sync failed for @${normalizedUsername}:`,
          err.message,
        ),
      );
    }

    // Build the final response structure
    const responseData = {
      success: true,
      data: {
        username: normalizedUsername,
        postCount: posts.length,
        posts: posts,
      },
    };

    // 5. Store response in memory cache
    cache.set(cacheKey, responseData);

    return res.json(responseData);
  } catch (error) {
    console.error(`❌ Route error for @${normalizedUsername}:`, error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching Medium posts",
      error: error.message,
    });
  }
});

export default router;
