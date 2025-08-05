// netlify/functions/summary.js
const playwright = require("playwright-aws-lambda");

exports.handler = async (event) => {
  try {
    // Paraméterek összerakása
    const queryString = event.rawQuery || "";
    const targetUrl = `https://acoachapp.github.io/acoach-summary/?${queryString}`;
    console.log("Betöltendő URL:", targetUrl);

    // Böngésző indítása Playwright-tal
    const browser = await playwright.launchChromium({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1920 },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();

    // Oldal betöltése
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });

    // Screenshot készítése PNG-ben
    const screenshotBuffer = await page.screenshot({ type: "png" });

    await browser.close();

    // PNG visszaadása HTTP válaszként
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'inline; filename="summary.png"'
      },
      body: screenshotBuffer.toString("base64"),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error("Hiba a summary generálás közben:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

