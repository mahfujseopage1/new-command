import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';

export const takeScreenshot = async (body) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        width: body?.width || 1200,
        height: body?.height || 800,
      },
      executablePath: await chromium.executablePath, // Use chrome-aws-lambda's executable path
      args: [
        ...chromium.args, // Use the optimized arguments from chrome-aws-lambda
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security', // For cross-origin handling
      ],
    });

    const page = await browser.newPage();
    await page.goto(body.url, { waitUntil: 'networkidle2' });

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

    // Capture the screenshot as a base64 string instead of a buffer
    const screenshotBase64 = await page.screenshot({ fullPage: true, encoding: 'base64' });

    // Return the base64-encoded image data
    return screenshotBase64;
  } catch (error) {
    console.error("Error taking screenshot:", error);
    return null; // or throw the error
  }
};
