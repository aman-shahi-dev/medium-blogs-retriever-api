import { Post } from "../models/Post.js";
import { parseRssXml } from "../utils/rssParser.js";
import { scrapeAllPosts } from "./scraperService.js";
import { extractMediumPostId } from "../utils/urlHelper.js";

/**
 * Fetch all posts for a user from MongoDB, sorted by publication date
 */
export async function getPostsByUsername(username) {
  const normalizedUsername = username.toLowerCase();
  return await Post.find({ username: normalizedUsername })
    .sort({ pubDate: -1, createdAt: -1 })
    .lean();
}

/**
 * Use Puppeteer to scrape all historical posts for a new user and store them in DB
 */
export async function fetchPostsForNewUser(username) {
  console.log(
    `🚀 Starting full Puppeteer scrape for new user: @${username}...`,
  );
  const scrapedPosts = await scrapeAllPosts(username);

  if (scrapedPosts.length === 0) {
    console.log(`⚠️ No posts found on Medium profile for @${username}`);
    return 0;
  }

  // Save/Update posts in MongoDB
  const savePromises = scrapedPosts.map((post) => {
    const postId = extractMediumPostId(post.link);
    return Post.findOneAndUpdate(
      { postId }, // Find by unique postId
      { $set: { ...post, postId } }, // Update with new data and set postId
      { upsert: true, new: true }, // Create if doesn't exist
    );
  });

  await Promise.all(savePromises);
  console.log(
    `✅ Successfully stored ${scrapedPosts.length} historical posts for @${username}`,
  );
  return scrapedPosts.length;
}

/**
 * Check the RSS feed to pull down the latest 10 posts and update/insert them in DB
 */
export async function syncNewPostsViaRSS(username) {
  const normalizedUsername = username.toLowerCase();
  const rssUrl = `https://medium.com/feed/@${normalizedUsername}`;

  console.log(`📡 Fetching RSS updates for @${normalizedUsername}...`);

  try {
    const response = await fetch(rssUrl);
    if (!response.ok) {
      throw new Error(`Medium RSS returned status ${response.status}`);
    }

    const xml = await response.text();
    const parsedPosts = parseRssXml(xml, normalizedUsername);

    if (parsedPosts.length === 0) {
      console.log(`ℹ️ No posts parsed from RSS for @${normalizedUsername}`);
      return 0;
    }

    // Save/Update newest posts in MongoDB
    const savePromises = parsedPosts.map((post) => {
      const postId = extractMediumPostId(post.link);
      return Post.findOneAndUpdate(
        { postId }, // Find by unique postId
        { $set: { ...post, postId } }, // Update with new data and set postId
        { upsert: true, new: true },
      );
    });

    await Promise.all(savePromises);
    console.log(`🔄 RSS sync complete for @${normalizedUsername}.`);
    return parsedPosts.length;
  } catch (error) {
    console.error(
      `❌ RSS sync failed for @${normalizedUsername}:`,
      error.message,
    );
    throw error;
  }
}

/**
 * Find all unique users in our database and check their RSS feeds for new posts
 */
export async function syncAllUsers() {
  console.log("⏰ Starting background sync for all known users...");
  try {
    const usernames = await Post.distinct("username");
    console.log(
      `👤 Found ${usernames.length} users to sync: ${usernames.join(", ")}`,
    );

    for (const username of usernames) {
      try {
        await syncNewPostsViaRSS(username);
        // Wait 2 seconds before requesting the next user to be safe
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (err) {
        console.error(
          `Failed background sync for user @${username}:`,
          err.message,
        );
      }
    }
    console.log("⏰ Background sync cycle complete.");
  } catch (error) {
    console.error(
      "❌ Failed to fetch usernames for background sync:",
      error.message,
    );
  }
}
