const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', async (req, res) => {
  let browser = null;
  try {
    console.log("Launching browser...");

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    console.log("Navigating to 9gag.com...");
    await page.goto('https://9gag.com', { waitUntil: 'networkidle2' });

    console.log("Getting page content...");
    const content = await page.content();

    console.log("Sending content to user.");
    res.send(content);

  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send('Error loading 9GAG: ' + error.message);
  } finally {
    if (browser !== null) {
      console.log("Closing browser.");
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
