// Gets content inside a single XML tag
// What it does? => Give it XML and a tag name and it will returns what's inside that tag
// extractTag("<title>Hello</title>","title") -> "Hello"

function extractTag(xml, tag) {
  const cdataRegex = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`,
    "i",
  );

  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

// What it does? => Same as extractTag but specifically for CDATA-wrapped content. Used for content:encoded which has the full blog post HTML

function extractCDATA(xml, tag) {
  const regex = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`,
    "i",
  );

  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

// What it does? => A post has multiple <category> tags. This returns ALL of them as an array: ["javascript", "react", "devops", "react"]

function extractAllTags(xml, tag) {
  const results = [];
  const regex = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`,
    "gi",
  );

  let match;
  while ((match = regex.exec(xml)) !== null) {
    const value = (match[1] || match[2] || "").trim();
    if (value) results.push(value);
  }
  return results;
}

// What it does? => Finds the first <img src="..."> in the post's HTML content and returns the image URL

function extractThumbnail(html) {
  if (!html) return "";
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch ? imgMatch[1] : "";
}

// What it does? => Strips all HTML tags and gives us the first 200 characters of the plain text

function extractExcerpt(html) {
  if (!html) return "";
  const text = html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= 200) return text;
  return text.substring(0, 200).replace(/\s+\S*$/, "") + "...";
}

// What it does? => RSS feeds encode & as &amp;, < as &lt;, etc. This converts them back to normal.

function decodeHtmlEntities(text) {
  if (!text) return "";
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ");
}

// THE MAIN FUNCTION

export function parseRssXml(xml, username) {
  const posts = [];
  const items = xml.split("<item>").slice(1);

  for (const item of items) {
    const closingIndex = item.indexOf("</item>");
    const itemXml =
      closingIndex !== -1 ? item.substring(0, closingIndex) : item;

    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const pubDate = extractTag(itemXml, "pubDate");
    const creator = extractTag(itemXml, "dc:creator");
    const categories = extractAllTags(itemXml, "category");

    const contentEncoded =
      extractCDATA(itemXml, "content:encoded") ||
      extractTag(itemXml, "description");

    const excerpt = extractExcerpt(contentEncoded);
    const thumbnail = extractThumbnail(contentEncoded);

    if (title && link) {
      posts.push({
        username: username.toLowerCase(),
        title: decodeHtmlEntities(title),
        link: link.trim(),
        pubDate: pubDate || new Date().toISOString(),
        author: decodeHtmlEntities(creator) || username,
        categories: categories.map((c) => decodeHtmlEntities(c)),
        excerpt: decodeHtmlEntities(excerpt),
        thumbnail,
        content: contentEncoded || "",
      });
    }
  }

  return posts;
}

export { extractExcerpt, extractThumbnail, decodeHtmlEntities };
