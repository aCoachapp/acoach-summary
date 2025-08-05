// netlify/functions/summary.js
const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

exports.handler = async (event) => {
  try {
    const query = event.rawQuery ? `?${event.rawQuery}` : "";
    const targetUrl = `https://acoachapp.github.io/acoach-summary/${query}`;

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    await page.goto(targetUrl, { waitUntil: "networkidle0" });

    const screenshot = await page.screenshot({ type: "png", omitBackground: true });
    await browser.close();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "attachment; filename=acoach_summary.png"
      },
      body: screenshot.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
