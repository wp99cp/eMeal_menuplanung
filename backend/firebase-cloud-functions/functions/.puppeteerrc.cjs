const {join} = require('path');

/**
 * Keeps the downloaded browser inside the functions directory,
 * such that it gets deployed together with the cloud functions.
 *
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
