import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), "..");
const outputPath = path.join(root, "mu_social_sentiment.json");
const execFileAsync = promisify(execFile);

const USER_AGENT = "Mozilla/5.0 jensencall-mu-refresh/1.0";
const REDDIT_MULTI = "MU_Stock+stocks+StockMarket+wallstreetbets";
const GENERATED_AT = new Date().toISOString();
const LOOKBACK_DAYS = 30;
const SEARCH_TIME_RANGE = "month";

const searchQueries = [
  "MU AI memory HBM",
  "Micron AI memory",
  "MU HBM DRAM",
  "MU stock",
  "Micron stock",
  "MU earnings AI",
  "Micron HBM",
  "Micron DRAM NAND",
  "Micron breakout memory",
  "MU Dell AI memory",
];

const searchSorts = ["new", "top", "comments"];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtml(value) {
  return String(value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#32;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function stripHtml(value) {
  return decodeHtml(String(value ?? "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(value, maxLength = 280) {
  const text = stripHtml(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function parseNumber(value) {
  return Number(String(value ?? "0").replace(/,/g, "")) || 0;
}

function extractAttr(block, name) {
  const match = block.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function redditUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url.replace("https://www.reddit.com", "https://old.reddit.com");
  return `https://old.reddit.com${url}`;
}

function mentionsMu(text) {
  return /(^|[^A-Z0-9_])\$?MU([^A-Z0-9_]|$)/.test(` ${String(text ?? "").toUpperCase()} `) ||
    /micron/i.test(String(text ?? ""));
}

function mentionsAiMemory(text) {
  const lower = String(text ?? "").toLowerCase();
  return [
    "ai",
    "$mu",
    " mu ",
    "micron",
    "hbm",
    "dram",
    "nand",
    "memory",
    "semiconductor",
    "chip",
    "dell",
    "datacenter",
    "data center",
    "breakout",
    "stock",
    "shares",
    "earnings",
    "guidance",
    "calls",
    "puts",
    "buy",
    "sell",
    "hold",
    "long",
    "short",
    "dip",
    "portfolio",
    "price target",
  ].some((term) => {
    if (term === "ai") return /(^|[^a-z0-9])ai([^a-z0-9]|$)/.test(lower);
    if (term === "$mu") return lower.includes("$mu");
    if (term === " mu ") return /(^|[^a-z0-9])mu([^a-z0-9]|$)/i.test(lower);
    return lower.includes(term);
  });
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function inLookbackWindow(signal) {
  const createdAt = parseDate(signal.createdAt);
  if (!createdAt) return false;
  const generatedAt = parseDate(GENERATED_AT) || new Date();
  const start = new Date(generatedAt);
  start.setUTCDate(start.getUTCDate() - LOOKBACK_DAYS);
  return createdAt >= start && createdAt <= generatedAt;
}

async function fetchText(url) {
  const { stdout } = await execFileAsync(
    "curl",
    ["-sS", "-L", "--fail", "--max-time", "20", "-A", USER_AGENT, url],
    { maxBuffer: 5 * 1024 * 1024 },
  );
  return stdout;
}

function searchUrl(query, sort = "new", after = "") {
  const params = new URLSearchParams({
    q: query,
    restrict_sr: "on",
    sort,
    t: SEARCH_TIME_RANGE,
  });
  if (after) {
    params.set("count", "25");
    params.set("after", after);
  }
  return `https://old.reddit.com/r/${REDDIT_MULTI}/search?${params.toString()}`;
}

function extractNextAfter(html) {
  const match = html.match(/after=(t3_[a-z0-9]+)[^"]*" rel="nofollow next"/i);
  return match ? match[1] : "";
}

function parseSearchResults(html) {
  const blocks = html.split('<div class=" search-result search-result-link').slice(1);
  return blocks
    .map((block) => {
      const fullBlock = `<div class=" search-result search-result-link${block}`;
      const titleLinkMatch = fullBlock.match(/<a [^>]*class="search-title may-blank"[^>]*>[\s\S]*?<\/a>/i);
      if (!titleLinkMatch) return null;
      const titleLink = titleLinkMatch[0];
      const title = stripHtml(titleLink.match(/>([\s\S]*?)<\/a>/i)?.[1] || "");
      const bodyMatch = fullBlock.match(/<div class="search-result-body">([\s\S]*?)<\/div>/i);
      const body = bodyMatch ? excerpt(bodyMatch[1], 360) : "";
      const sourceText = `${title} ${body}`;
      const comment = excerpt(`${title}. ${body}`, 300);
      const scoreMatch = fullBlock.match(/<span class="search-score">([\d,]+) points?<\/span>/i);
      const commentsMatch = fullBlock.match(/class="search-comments may-blank"[^>]*>([\d,]+) comments?<\/a>/i);
      const subredditMatch = fullBlock.match(/class="search-subreddit-link may-blank"[^>]*>([\s\S]*?)<\/a>/i);
      const datetimeMatch = fullBlock.match(/datetime="([^"]+)"/i);

      if (!mentionsMu(comment) || !mentionsAiMemory(sourceText)) return null;

      return {
        id: `mu-${extractAttr(fullBlock, "data-fullname") || title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        ticker: "MU",
        platform: "Reddit",
        subreddit: subredditMatch ? stripHtml(subredditMatch[1]) : "Reddit",
        sourceLabel: `${subredditMatch ? stripHtml(subredditMatch[1]) : "Reddit"} · ${parseNumber(scoreMatch?.[1])} pts · ${parseNumber(
          commentsMatch?.[1],
        )} comments`,
        sourceTitle: title,
        kind: "post",
        likes: parseNumber(scoreMatch?.[1]),
        replies: parseNumber(commentsMatch?.[1]),
        reposts: 0,
        source: redditUrl(extractAttr(titleLink, "href")),
        comment,
        createdAt: datetimeMatch?.[1] || GENERATED_AT,
        capturedAt: GENERATED_AT,
        remote: true,
      };
    })
    .filter(Boolean)
    .filter(inLookbackWindow)
    .filter((signal) => signal.likes + signal.replies * 2 >= 8);
}

const signalsByUrl = new Map();
const warnings = [];

for (const query of searchQueries) {
  for (const sort of searchSorts) {
    const maxPages = sort === "new" ? 2 : 1;
    let after = "";

    for (let page = 0; page < maxPages; page += 1) {
      console.log(`Searching MU social sentiment: ${query} · ${sort} · page ${page + 1}`);
      try {
        const html = await fetchText(searchUrl(query, sort, after));
        for (const signal of parseSearchResults(html)) {
          const existing = signalsByUrl.get(signal.source);
          if (!existing || existing.likes + existing.replies * 2 < signal.likes + signal.replies * 2) {
            signalsByUrl.set(signal.source, signal);
          }
        }
        after = sort === "new" ? extractNextAfter(html) : "";
        if (!after) break;
      } catch (error) {
        warnings.push(`${query} ${sort}: ${error.message}`);
        console.warn(`Search failed: ${error.message}`);
        break;
      }
      await sleep(700);
    }
  }
}

const signals = Array.from(signalsByUrl.values()).toSorted(
  (a, b) => b.likes + b.replies * 2 - (a.likes + a.replies * 2),
);

if (!signals.length) {
  throw new Error("MU refresh returned 0 usable signals; keeping the previous mu_social_sentiment.json unchanged.");
}

const payload = {
  generatedAt: GENERATED_AT,
  ticker: "MU",
  company: "Micron Technology",
  lookbackDays: LOOKBACK_DAYS,
  timeRange: SEARCH_TIME_RANGE,
  source: "Public Reddit old.reddit.com search, past month, fetched without login",
  searchedQueries: searchQueries,
  searchedSorts: searchSorts,
  warnings,
  note: "Post-level Reddit search signals only; no login-only social metrics were used. Results are filtered to posts dated within the latest 30 days at refresh time.",
  signals: signals.slice(0, 90),
};

await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`Wrote ${payload.signals.length} MU signals to ${path.relative(root, outputPath)}`);
console.table(
  payload.signals.slice(0, 10).map((signal) => ({
    title: signal.sourceTitle.slice(0, 50),
    likes: signal.likes,
    comments: signal.replies,
  })),
);
