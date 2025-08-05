// netlify/functions/summary.js

const playwright = require("playwright-aws-lambda");

exports.handler = async (event) => {
  try {
    // A bejövő query paraméterek (WorkoutName, DurationFormatted, stb.)
    const queryString = event.rawQuery || "";
    const targetUrl = `https://acoachapp.github.io/acoach-summary/?${queryString}`;

    console.log("Betöltendő URL:", targetUrl);

    // Böngésző indítása
    const browser = await playwright.launchChromium({
      headless: true
    });

    const page = await browser.newPage({
      viewport: { width: 1080, height: 1920 }
    });

    // Oldal betöltése
    await page.goto(targetUrl, { waitUntil: "networkidle" });

    // Screenshot készítése PNG-ben
    const screenshotBuffer = await page.screenshot({
      type: "png",
      fullPage: true
    });

    await browser.close();

    // Visszatérés PNG-ként
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "inline; filename=summary.png"
      },
      body: screenshotBuffer.toString("base64"),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error("Hiba a summary generálás közben:", error);
    return {
      statusCode: 500,
      body: `Error generating summary: ${error.message}`
    };
  }
};
