/**
 * Augment an existing sitemap.xml with dynamic route URLs derived from slugs
 * found in the repository (JS/JSON/TS).
 *
 * - Finds slug values via regex in repo files (skips node_modules/.git/etc.)
 * - Appends https://<BASE_URL>/<ROUTE_PAGE>?slug=<slug> to sitemap
 * - Dedupes existing URLs (including ones already in sitemap)
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = (process.env.BASE_URL || "https://georgiagravel.com/").replace(/\/+$/, "/");
const ROUTE_PAGE = process.env.ROUTE_PAGE || "route.html";
const SITEMAP_PATH = process.env.SITEMAP_PATH || "sitemap.xml";

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "public", "build", ".next", ".vercel"]);
const ALLOWED_EXT = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".json"]);

function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      out.push(...walk(p));
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (ALLOWED_EXT.has(ext)) out.push(p);
    }
  }
  return out;
}

function extractSlugsFromText(text) {
  const slugs = new Set();

  // Matches: slug: "abc"  OR  slug:'abc'
  const re1 = /\bslug\s*:\s*["']([^"']+)["']/g;
  // Matches: "slug": "abc"
  const re2 = /["']slug["']\s*:\s*["']([^"']+)["']/g;

  let m;
  while ((m = re1.exec(text)) !== null) slugs.add(m[1]);
  while ((m = re2.exec(text)) !== null) slugs.add(m[1]);

  return slugs;
}

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function readSitemapXml(p) {
  if (!fs.existsSync(p)) {
    throw new Error(`Sitemap not found at ${p}`);
  }
  return fs.readFileSync(p, "utf8");
}

function extractExistingLocs(xml) {
  const locs = new Set();
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) locs.add(m[1].trim());
  return locs;
}

function ensureUrlset(xml) {
  if (xml.includes("<urlset")) return xml;
  // Fallback if somehow not a standard sitemap
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `</urlset>\n`;
}

function addUrlsToSitemap(xml, urlsToAdd) {
  xml = ensureUrlset(xml);

  const insertionPoint = xml.lastIndexOf("</urlset>");
  if (insertionPoint === -1) {
    throw new Error("Invalid sitemap.xml: missing </urlset>");
  }

  const newUrlBlocks = urlsToAdd
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join("\n");

  const before = xml.slice(0, insertionPoint).replace(/\s*$/, "");
  const after = xml.slice(insertionPoint);

  return `${before}\n${newUrlBlocks}\n${after}`;
}

function main() {
  const repoRoot = process.cwd();
  const files = walk(repoRoot);

  const slugs = new Set();
  for (const f of files) {
    // avoid self-reading giant lockfiles etc by size
    const stat = fs.statSync(f);
    if (stat.size > 2_000_000) continue;

    const txt = readFileSafe(f);
    if (!txt) continue;

    const found = extractSlugsFromText(txt);
    for (const s of found) slugs.add(s);
  }

  if (slugs.size === 0) {
    console.log("No slugs found in repo. Sitemap left unchanged.");
    return;
  }

  const sitemapXml = readSitemapXml(SITEMAP_PATH);
  const existing = extractExistingLocs(sitemapXml);

  const urls = Array.from(slugs)
    .map((s) => `${BASE_URL}${ROUTE_PAGE}?slug=${encodeURIComponent(s)}`)
    .filter((u) => !existing.has(u))
    .sort();

  console.log(`Found ${slugs.size} slugs.`);
  console.log(`Adding ${urls.length} route URLs to sitemap: ${SITEMAP_PATH}`);

  if (urls.length === 0) {
    console.log("No new URLs to add. Sitemap left unchanged.");
    return;
  }

  const updated = addUrlsToSitemap(sitemapXml, urls);
  fs.writeFileSync(SITEMAP_PATH, updated, "utf8");

  console.log("Sitemap updated successfully.");
}

main();
