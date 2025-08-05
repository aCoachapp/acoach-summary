const playwright = require("playwright-aws-lambda");

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const baseUrl = "https://acoachapp.github.io/acoach-summary/";

    const searchParams = new URLSearchParams(params).toString();
    const targetUrl = `${baseUrl}?${searchParams}`;

    console.log("Betöltendő URL:", targetUrl);

    const browser = await playwright.launchChromium({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1080, height: 1920, deviceScaleFactor: 1 }
    });

    await page.goto(targetUrl, { waitUntil: "networkidle" });

    const buffer = await page.screenshot({ type: "png", omitBackground: true });

    await browser.close();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "inline; filename=summary.png"
      },
      body: buffer.toString("base64"),
      isBase64Encoded: true
    };
  } catch (err) {
    console.error("Hiba a summary generálás közben:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

