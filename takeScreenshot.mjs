import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// URL of the Chromium tar file
const CHROMIUM_PATH =
  'https://vomrghiulbmrfvmhlflk.supabase.co/storage/v1/object/public/chromium-pack/chromium-v123.0.0-pack.tar';

// Function to get the browser instance based on the environment
async function getBrowser() {
  try {
    let browser;
    if (process.env.NODE_ENV === 'production') {
      // In production, use the sparticuz/chromium-min to fetch Chromium from the URL
      const executablePath = await chromium.executablePath(CHROMIUM_PATH);

      // Launch Puppeteer with the extracted Chromium
      browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
          width: 1200, // or provide dynamic width like body?.width
          height: 800, // or provide dynamic height like body?.height
        },
        executablePath,  // Ensure this points to the correct Chromium binary
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-gpu',
          '--single-process',
        ],
      });
    } else {
      // In development or non-production environments, use local Puppeteer
      const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';  // Make sure Chrome is installed here
      browser = await puppeteer.launch({
        executablePath,
        headless: true,
        defaultViewport: {
          width: 1200,
          height: 800,
        },
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-gpu',
          '--single-process',
        ],
      });
    }

    return browser;
  } catch (error) {
    console.error('Error launching browser:', error);
    throw error;
  }
}

// Main function to take a screenshot
export const takeScreenshot = async (body) => {
  try {
    const browser = await getBrowser();

    const page = await browser.newPage();
    await page.goto(body.url, { waitUntil: 'networkidle2' });

    // Handle scrolling on the page
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    // Capture the screenshot as a base64 string
    const screenshotBase64 = await page.screenshot({ fullPage: true, encoding: 'base64' });

    await browser.close();

    return screenshotBase64;
  } catch (error) {
    console.error('Error taking screenshot:', error);
    return null; // or throw error based on your use case
  }
};
