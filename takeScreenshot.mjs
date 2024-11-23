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
      executablePath: chromium.executablePath || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Add path for Chrome if available
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-gpu',
        '--single-process',
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

    const screenshotBase64 = await page.screenshot({ fullPage: true, encoding: 'base64' });

    await browser.close();

    return screenshotBase64;
  } catch (error) {
    console.error('Error taking screenshot:', error);
    return null;
  }
};
