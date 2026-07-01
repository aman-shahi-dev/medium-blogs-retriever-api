const { join } = require('path');

/**
 * Puppeteer configuration.
 * Stores the Chrome browser binary inside the project directory
 * so it persists across Render's build and runtime phases.
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
