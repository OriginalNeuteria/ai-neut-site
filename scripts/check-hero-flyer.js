/* Confirms the homepage device actually paints the tester flyer.
   Requires playwright-core and Google Chrome.
   Usage: node scripts/check-hero-flyer.js [--url http://127.0.0.1:8765/index.html] [--shots dir] */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright-core");

const LETTER = [9, 7, 18];
const WIDTHS = [360, 393, 430, 768, 1024, 1280, 1440, 1920];
const CHROME = process.env.CHROME || "/usr/bin/google-chrome";

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function pixelAt(png, x, y) {
  const file = path.join("/tmp", "hero-flyer-shot.png");
  const raw = path.join("/tmp", "hero-flyer-px.raw");
  fs.writeFileSync(file, png);
  const cx = Math.max(0, Math.round(x));
  const cy = Math.max(0, Math.round(y));
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", file, "-vf", "crop=1:1:" + cx + ":" + cy, "-f", "rawvideo", "-pix_fmt", "rgb24", raw]);
  const buf = fs.readFileSync(raw);
  return [buf[0], buf[1], buf[2]];
}

function isLetterbox(px) {
  return Math.abs(px[0] - LETTER[0]) <= 2 && Math.abs(px[1] - LETTER[1]) <= 2 && Math.abs(px[2] - LETTER[2]) <= 2;
}

async function ready(page) {
  await page.waitForFunction(() => {
    const img = document.querySelector(".lt-flyer");
    return img && img.complete && img.naturalWidth > 0;
  });
  await page.evaluate(() => document.querySelector(".lt-flyer").decode());
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function measure(page) {
  return page.evaluate(() => {
    const img = document.querySelector(".lt-flyer");
    const r = img.getBoundingClientRect();
    return {
      w: r.width,
      h: r.height,
      cx: r.x + r.width / 2,
      cy: r.y + r.height / 2,
      inView: r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth,
      decoding: img.decoding,
      nw: img.naturalWidth
    };
  });
}

async function checkOnce(browser, opts) {
  const context = await browser.newContext({
    viewport: { width: opts.w, height: opts.h },
    deviceScaleFactor: 1,
    reducedMotion: opts.motion
  });
  const page = await context.newPage();
  if (opts.cold) {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  }
  if (opts.banner === "off") await page.addInitScript(() => localStorage.setItem("tb-off", "1"));
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(opts.url, { waitUntil: "load" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await ready(page);
  const box = await measure(page);
  let px;
  if (box.inView) {
    px = pixelAt(await page.screenshot(), box.cx, box.cy);
  } else {
    const buf = await page.locator(".lt-flyer").screenshot();
    fs.writeFileSync("/tmp/hero-flyer-el.png", buf);
    const dim = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", "/tmp/hero-flyer-el.png"], { encoding: "utf8" }).trim().split(",");
    px = pixelAt(buf, Number(dim[0]) / 2, Number(dim[1]) / 2);
  }
  const fail = [];
  if (!(box.w > 0 && box.h > 0)) fail.push("zero box");
  if (isLetterbox(px)) fail.push("center pixel is the letterbox " + px.join(","));
  if (errors.length) fail.push(errors.join("; "));
  await context.close();
  return { w: opts.w, motion: opts.motion, banner: opts.banner, box, px, fail };
}

async function shoot(browser, url, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const views = [
    { w: 360, h: 800, hero: "element" },
    { w: 393, h: 852, hero: "element", full: true },
    { w: 430, h: 932, hero: "element" },
    { w: 768, h: 1024, hero: "element" },
    { w: 1024, h: 900, hero: "viewport" },
    { w: 1280, h: 900, hero: "viewport", full: true },
    { w: 1440, h: 900, hero: "viewport" },
    { w: 1920, h: 1080, hero: "viewport" }
  ];
  for (const spec of views) {
    const context = await browser.newContext({
      viewport: { width: spec.w, height: spec.h },
      deviceScaleFactor: 1,
      reducedMotion: "no-preference"
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "load" });
    await page.evaluate(() => window.scrollTo(0, 0));
    await ready(page);
    const box = await measure(page);
    const px = box.inView
      ? pixelAt(await page.screenshot(), box.cx, box.cy)
      : pixelAt(await page.locator(".lt-flyer").screenshot(), 10, 10);
    if (!(box.w > 0 && box.h > 0) || (box.inView && isLetterbox(px))) {
      throw new Error(spec.w + " flyer blank or zero " + JSON.stringify({ box, px }));
    }
    if (!box.inView) {
      const el = await page.locator(".lt-flyer").screenshot();
      fs.writeFileSync("/tmp/hero-flyer-el.png", el);
      const dim = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", "/tmp/hero-flyer-el.png"], { encoding: "utf8" }).trim().split(",").map(Number);
      const center = pixelAt(el, dim[0] / 2, dim[1] / 2);
      if (isLetterbox(center)) throw new Error(spec.w + " element center is letterbox " + center.join(","));
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => {
      const h1 = document.querySelector(".hero-copy h1");
      if (!h1) return true;
      const op = parseFloat(getComputedStyle(h1).opacity);
      return op > 0.95;
    }, null, { timeout: 4000 }).catch(() => {});
    if (spec.hero === "viewport") await page.screenshot({ path: path.join(dir, "hero-" + spec.w + ".png") });
    else await page.locator(".stage-hero").screenshot({ path: path.join(dir, "hero-" + spec.w + ".png") });
    if (spec.full) await page.screenshot({ path: path.join(dir, "full-" + spec.w + ".png"), fullPage: true });
    console.log("shot", spec.w, "center", px.join(","), "box", Math.round(box.w) + "x" + Math.round(box.h));
    await context.close();
  }
}

(async () => {
  const url = arg("--url", "http://127.0.0.1:8765/index.html");
  const shots = arg("--shots", "");
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"]
  });
  const heights = { 360: 800, 393: 852, 430: 932, 768: 1024, 1024: 900, 1280: 900, 1440: 900, 1920: 1080 };
  const jobs = [];
  for (const w of WIDTHS) {
    for (const motion of ["reduce", "no-preference"]) {
      for (const banner of ["on", "off"]) {
        jobs.push({ w, h: heights[w], motion, banner, url, cold: w === 1280 && motion === "reduce" && banner === "on" });
      }
    }
  }
  let failed = 0;
  for (const job of jobs) {
    const result = await checkOnce(browser, job);
    const status = result.fail.length ? "FAIL" : "OK";
    if (result.fail.length) failed++;
    console.log(status, result.w, result.motion, "banner", result.banner, "box", Math.round(result.box.w) + "x" + Math.round(result.box.h), "px", result.px.join(","), result.fail.join("; "));
  }
  if (shots) await shoot(browser, url, shots);
  await browser.close();
  if (failed) process.exit(1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
