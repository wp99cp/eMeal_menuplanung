const {join} = require('path');

/**
 * Keeps the downloaded browser inside the node_modules directory. The build of the cloud functions
 * caches this directory, thus the browser must be part of it. Otherwise, it would be missing as
 * soon as a build reuses the cached packages.
 *
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
    cacheDirectory: join(__dirname, 'node_modules', '.cache', 'puppeteer'),
};
