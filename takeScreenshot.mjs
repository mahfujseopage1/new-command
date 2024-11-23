import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const takeScreenshot = async (body) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        width: body?.width || 1200,
        height: body?.height || 800,
      },
      executablePath: await chromium.executablePath,  // Get the correct path from sparticuz/chromium
      args: [
        ...chromium.args,  // Use the optimized args for serverless environments
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security', // For cross-origin handling
        '--disable-gpu',
        '--single-process',
      ],
    });

    const page = await browser.newPage();
    await page.goto(body.url, { waitUntil: 'networkidle2' });

    // Handle scrolling
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

    // Capture the screenshot as base64
    const screenshotBase64 = await page.screenshot({ fullPage: true, encoding: 'base64' });

    await browser.close();

    return screenshotBase64;
  } catch (error) {
    console.error("Error taking screenshot:", error);
    return null;
  }
};
