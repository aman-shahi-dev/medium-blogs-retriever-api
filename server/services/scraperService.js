import puppeteer from "puppeteer";

export async function scrapeAllPosts(username) {
  console.log(`Launching Puppeteer for ${username}...`);

  // Launch Chrome in stealthy standard headless mode (bypasses Cloudflare)
  // while pushing the window off-screen to prevent the Windows white screen flash
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--window-position=-2400,-2400", "--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Forward browser console logs to Node console
    page.on("console", (msg) => console.log(`[Browser] ${msg.text()}`));

    // 🕵️‍♂️ Anti-bot detection bypass: Hide navigator.webdriver
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
    });

    // Set a realistic user-agent so Medium doesn't block us
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    );

    // Go to the user's Medium profile
    await page.goto(`https://medium.com/@${username}`, {
      waitUntil: "networkidle2", // wait until the page is fully loaded
      timeout: 60000, // 60 second timeout
    });

    // Scroll to the bottom to load ALL posts
    // Medium uses infinite scroll - posts load as you scroll down
    let previousHeight;
    while (true) {
      previousHeight = await page.evaluate(() => document.body.scrollHeight);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise((resolve) => setTimeout(resolve, 2000)); // wait for 2 seconds
      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      if (newHeight === previousHeight) break; // No more posts to load
    }

    // Extract all post data from the page
    const posts = await page.evaluate(() => {
      const articles = [];
      const seen = new Set();
      
      document.querySelectorAll("a").forEach((a) => {
        const rawHref = a.href;
        if (!rawHref) return;

        // Clean query parameters and trailing slashes first
        const cleanLink = rawHref.split("?")[0].replace(/\/$/, "");
        
        if (
          cleanLink.includes("medium.com") &&
          (cleanLink.includes("-") || cleanLink.includes("/p/")) &&
          cleanLink.match(/[a-f0-9]{8,}/) &&
          !cleanLink.includes("/tag/") &&
          !cleanLink.includes("/about") &&
          !cleanLink.includes("/followers") &&
          !cleanLink.includes("/m/signin") &&
          !seen.has(cleanLink)
        ) {
          seen.add(cleanLink);
          
          const container = a.closest("article") || a.parentElement?.parentElement;

          // Try to get title
          const titleEl = container?.querySelector("h2") || 
                          container?.querySelector("h1") || 
                          container?.querySelector("h3") ||
                          a.querySelector("h2") ||
                          a.querySelector("h3") ||
                          a; // Fallback to link element itself if it contains the text

          // Find the article's featured image (ignoring author avatars)
          const imgEls = container ? Array.from(container.querySelectorAll("img")) : [];
          let featuredImg = null;
          
          for (const img of imgEls) {
            const src = img.src;
            if (src && src.includes("miro.medium.com")) {
              // Avatars have small resize:fill:40:40 or similar parameters, or a small width
              const isAvatar = src.includes("resize:fill:40:40") ||
                               src.includes("resize:fill:20:20") ||
                               src.includes("resize:fill:32:32") ||
                               src.includes("resize:fill:30:30") ||
                               img.width <= 40;
                               
              if (!isAvatar) {
                featuredImg = img;
                break;
              }
            }
          }

          let imgUrl = "";
          if (featuredImg && featuredImg.src) {
            // Upscale the image to high-res by modifying Medium's CDN parameters
            imgUrl = featuredImg.src
              .replace(/resize:fill:\d+:\d+/, "resize:fill:640:360")
              .replace(/resize:fit:\d+/, "resize:fit:720");
          }

          if (titleEl && titleEl.textContent.trim()) {
            articles.push({
              title: titleEl.textContent.trim(),
              link: cleanLink,
              thumbnail: imgUrl,
            });
          }
        }
      });

      return articles;
    });

    // Add username to each post and return
    return posts.map((post) => ({
      ...post,
      username: username.toLowerCase(),
      pubDate: null, // Profile page doesn't always show exact dates
      author: username,
      categories: [],
      excerpt: "",
      content: "",
    }));
  } catch (error) {
    console.error(`Error during scraping: ${error.message}`);
    throw error;
  } finally {
    // This runs no matter what, preventing memory leaks!
    await browser.close();
  }
}
