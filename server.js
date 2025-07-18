const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const app = express();
const PORT = process.env.PORT || 10000;

// A realistic user agent
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

let browser;

async function startServer() {
  console.log("Launching one-time browser instance...");
  browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
  console.log("Browser launched successfully!");

  app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
  });
}

app.get('/', async (req, res) => {
  if (!browser) {
    return res.status(503).send('Service is not ready, please try again in a moment.');
  }

  let page;
  try {
    console.log("Opening new page for a request...");
    page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent(USER_AGENT);

    console.log("Navigating to 9gag.com with robust settings...");
    await page.goto('https://9gag.com', {
      waitUntil: 'domcontentloaded', // Wait only for the main document, not all images/scripts
      timeout: 60000 // Increase timeout to 60 seconds
    });
    
    console.log("Getting page content...");
    const content = await page.content();
    
    console.log("Sending content to user.");
    res.send(content);

  } catch (error) {
    console.error("An error occurred during a request:", error);
    res.status(500).send('Error loading 9GAG: ' + error.message);
  } finally {
    if (page) {
      console.log("Closing page.");
      await page.close();
    }
  }
});

startServer();
