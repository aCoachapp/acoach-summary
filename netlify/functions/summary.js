// netlify/functions/summary.js

const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

exports.handler = async (event, context) => {
  try {
    // Alap GitHub Pages URL, ami az index.html-re mutat
    const baseUrl = "https://acoachapp.github.io/acoach-summary/";

    // Az összes query paramétert továbbítjuk a GitHub oldalnak
    const params = event.queryStringParameters;
    const urlParams = new URLSearchParams(params).toString();
    const finalUrl = `${baseUrl}?${urlParams}`;

    console.log("Betöltendő URL:", finalUrl);

    // Böngésző indítása Netlify környezetben
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Canvas méret 1080x1920
    await page.setViewport({ width: 1080, height: 1920 });

    // Oldal betöltése
    await page.goto(finalUrl, { waitUntil: "networkidle0" });

    // Screenshot készítése PNG formátumban
    const screenshot = await page.screenshot({ type: "png", omitBackground: true });

    await browser.close();

    // PNG visszaadása letöltésre
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "attachment; filename=summary.png"
      },
      body: screenshot.toString("base64"),
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
