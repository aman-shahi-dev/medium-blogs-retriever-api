/**
 * Extracts the unique Medium Post ID from any Medium article URL.
 * Matches formats:
 * - https://medium.com/@username/title-slug-postId
 * - https://medium.com/p/postId
 * - https://medium.com/publication-name/title-slug-postId
 */
export function extractMediumPostId(url) {
  if (!url) return null;
  
  // Remove query parameters and trailing slash
  const cleanUrl = url.split("?")[0].replace(/\/$/, "");
  
  // Split path segments
  const segments = cleanUrl.split("/");
  const lastSegment = segments[segments.length - 1];
  
  // If the URL is in the format medium.com/p/postId
  if (segments.includes("p") && lastSegment) {
    return lastSegment;
  }
  
  // Otherwise, it's in the format medium.com/@username/title-slug-postId
  // The postId is after the last hyphen '-' in the last segment
  const hyphenIndex = lastSegment.lastIndexOf("-");
  if (hyphenIndex !== -1) {
    return lastSegment.substring(hyphenIndex + 1);
  }
  
  return lastSegment; // fallback
}
