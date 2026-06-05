import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), "..");
const outputPath = path.join(root, "social_ai_signals.json");
const execFileAsync = promisify(execFile);

const USER_AGENT = "Mozilla/5.0 jensencall-social-refresh/1.0";
const REDDIT_MULTI = "stocks+StockMarket+wallstreetbets+NVDA_Stock+AMD_Stock+PLTR+BroadcomStock+MU_Stock";
const GENERATED_AT = new Date().toISOString();

const aiStocks = [
  "NVDA",
  "GOOGL",
  "MSFT",
  "AMZN",
  "META",
  "AVGO",
  "AMD",
  "TSM",
  "PLTR",
  "CRWV",
  "MRVL",
  "ARM",
  "COHR",
  "SNPS",
  "INTC",
  "MU",
  "CRWD",
  "VRT",
  "ORCL",
  "DELL",
];

const aiTerms = [
  "ai",
  "artificial intelligence",
  "accelerator",
  "accelerators",
  "asic",
  "blackwell",
  "capex",
  "compute",
  "datacenter",
  "data center",
  "gpu",
  "hbm",
  "hyperscaler",
  "inference",
  "jensen",
  "rubin",
  "tpu",
  "xpu",
];

const searchQueries = [
  "AI stock",
  "AI stocks",
  "AI chip",
  "AI infrastructure",
  "Jensen NVDA AI",
  "NVDA AMD AVGO AI",
  "MSFT NVDA AI",
  "PLTR AI",
  "MU AI",
  "GOOGL AI",
  "TSMC AI",
  "CRWD AI",
];

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
  return `${text.slice(0, maxLength - 1).trim()}…`;
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

function normaliseTicker(ticker) {
  if (ticker === "TSMC") return "TSM";
  return ticker;
}

function tickersIn(text) {
  const haystack = ` ${String(text ?? "").toUpperCase()} `;
  return aiStocks.filter((ticker) => {
    const aliases = ticker === "TSM" ? ["TSM", "TSMC"] : [ticker];
    return aliases.some((alias) => new RegExp(`(^|[^A-Z0-9])\\$?${alias}([^A-Z0-9]|$)`).test(haystack));
  });
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mentionsAi(text) {
  const lower = String(text ?? "").toLowerCase();
  return aiTerms.some((term) => {
    const escaped = escapeRegex(term);
    if (/^[a-z0-9]{1,3}$/.test(term)) {
      return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(lower);
    }
    return lower.includes(term);
  });
}

async function fetchText(url) {
  const { stdout } = await execFileAsync(
    "curl",
    ["-sS", "-L", "--fail", "--max-time", "20", "-A", USER_AGENT, url],
    { maxBuffer: 5 * 1024 * 1024 },
  );
  return stdout;
}

function parseSearchResults(html) {
  const blocks = html.split('<div class=" search-result search-result-link').slice(1);
  return blocks
    .map((block) => {
      const fullBlock = `<div class=" search-result search-result-link${block}`;
      const titleLinkMatch = fullBlock.match(/<a [^>]*class="search-title may-blank"[^>]*>[\s\S]*?<\/a>/i);
      if (!titleLinkMatch) return null;
      const titleLink = titleLinkMatch[0];
      const href = extractAttr(titleLink, "href");
      const titleText = titleLink.match(/>([\s\S]*?)<\/a>/i)?.[1] || "";

      const bodyMatch = fullBlock.match(/<div class="search-result-body">([\s\S]*?)<\/div>/i);
      const subredditMatch = fullBlock.match(/class="search-subreddit-link may-blank"[^>]*>([\s\S]*?)<\/a>/i);
      const datetimeMatch = fullBlock.match(/datetime="([^"]+)"/i);
      const scoreMatch = fullBlock.match(/<span class="search-score">([\d,]+) points?<\/span>/i);
      const commentsMatch = fullBlock.match(/class="search-comments may-blank"[^>]*>([\d,]+) comments?<\/a>/i);
      const title = stripHtml(titleText);
      const body = bodyMatch ? excerpt(bodyMatch[1], 360) : "";

      return {
        title,
        body,
        url: redditUrl(href),
        subreddit: subredditMatch ? stripHtml(subredditMatch[1]) : "",
        createdAt: datetimeMatch?.[1] || "",
        score: parseNumber(scoreMatch?.[1]),
        comments: parseNumber(commentsMatch?.[1]),
        tickers: tickersIn(`${title} ${body}`),
        aiMentioned: mentionsAi(`${title} ${body}`),
      };
    })
    .filter(Boolean);
}

function parsePost(html, fallback) {
  const postMatch = html.match(/<div class=" thing id-t3_[\s\S]*?data-type="link"[\s\S]*?(?=<div class="clearleft"><\/div>\s*<\/div>\s*<div class="clearleft"><\/div>|<div class="commentarea">)/i);
  const block = postMatch?.[0] || "";
  const titleMatch = block.match(/class="title may-blank[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
  const bodyMatch = block.match(/<div class="usertext-body may-blank-within md-container "\s*>\s*<div class="md">([\s\S]*?)<\/div>\s*<\/div>/i);
  const metaDescription = html.match(/<meta property="og:description" content="([^"]*)"/i)?.[1] || "";
  const title = titleMatch ? stripHtml(titleMatch[1]) : fallback.title;
  const body = bodyMatch ? excerpt(bodyMatch[1], 360) : fallback.body || excerpt(metaDescription, 280);
  const sourceText = `${title} ${body}`;
  const tickers = tickersIn(sourceText);

  return {
    id: extractAttr(block, "data-fullname") || fallback.url.split("/comments/")[1]?.split("/")[0] || fallback.url,
    type: "post",
    title,
    body,
    url: redditUrl(extractAttr(block, "data-permalink")) || fallback.url,
    subreddit: extractAttr(block, "data-subreddit-prefixed") || fallback.subreddit,
    createdAt: extractAttr(block, "data-timestamp")
      ? new Date(Number(extractAttr(block, "data-timestamp"))).toISOString()
      : fallback.createdAt,
    score: parseNumber(extractAttr(block, "data-score")) || fallback.score,
    comments: parseNumber(extractAttr(block, "data-comments-count")) || fallback.comments,
    tickers,
    aiMentioned: mentionsAi(sourceText),
  };
}

function parseComments(html, post) {
  return html
    .split('<div class=" thing id-t1_')
    .slice(1)
    .map((block) => {
      const fullBlock = `<div class=" thing id-t1_${block}`;
      const bodyMatch = fullBlock.match(/<div class="usertext-body may-blank-within md-container "\s*>\s*<div class="md">([\s\S]*?)<\/div>\s*<\/div>/i);
      if (!bodyMatch) return null;

      const text = excerpt(bodyMatch[1], 260);
      if (!text || text === "[deleted]" || text === "[removed]") return null;

      const scoreMatch = fullBlock.match(/<span class="score unvoted" title="([\d,]+)">/i);
      const childrenMatch = fullBlock.match(/\(([\d,]+) children?\)/i);
      const datetimeMatch = fullBlock.match(/datetime="([^"]+)"/i);
      const commentTickers = tickersIn(text);
      const inheritedTickers = post.tickers.length === 1 ? post.tickers : [];
      const tickers = commentTickers.length ? commentTickers : inheritedTickers;

      return {
        id: extractAttr(fullBlock, "data-fullname"),
        type: "comment",
        title: post.title,
        body: text,
        url: redditUrl(extractAttr(fullBlock, "data-permalink")),
        subreddit: post.subreddit,
        createdAt: datetimeMatch?.[1] || post.createdAt,
        score: parseNumber(scoreMatch?.[1]),
        comments: parseNumber(childrenMatch?.[1]),
        tickers,
        aiMentioned: mentionsAi(`${post.title} ${text}`),
      };
    })
    .filter(Boolean);
}

function signalFromItem(item, ticker) {
  const label = `${item.subreddit || "Reddit"} · ${item.score} pts · ${item.comments} ${
    item.type === "post" ? "comments" : "replies"
  }`;
  const prefix = item.type === "post" ? item.title : `${item.title} / comment`;
  const comment = item.type === "post" ? `${item.title}. ${item.body}` : item.body;

  return {
    id: `${item.id}-${ticker}`,
    ticker: normaliseTicker(ticker),
    platform: "Reddit",
    subreddit: item.subreddit,
    sourceLabel: label,
    sourceTitle: prefix,
    kind: item.type,
    likes: item.score,
    replies: item.comments,
    reposts: 0,
    source: item.url,
    comment: excerpt(comment, 260),
    createdAt: item.createdAt || GENERATED_AT,
    capturedAt: GENERATED_AT,
    remote: true,
  };
}

function searchUrl(query) {
  const params = new URLSearchParams({
    q: query,
    restrict_sr: "on",
    sort: "top",
    t: "week",
  });
  return `https://old.reddit.com/r/${REDDIT_MULTI}/search?${params.toString()}`;
}

const candidates = new Map();

for (const query of searchQueries) {
  const url = searchUrl(query);
  console.log(`Searching Reddit: ${query}`);
  try {
    const html = await fetchText(url);
    for (const result of parseSearchResults(html)) {
      const key = result.url.replace(/\?.*$/, "");
      const existing = candidates.get(key);
      const hasTicker = result.tickers.length > 0;
      if ((hasTicker || result.aiMentioned) && result.score + result.comments >= 20) {
        candidates.set(key, existing && existing.score > result.score ? existing : result);
      }
    }
  } catch (error) {
    console.warn(`Search failed: ${error.message}`);
  }
  await sleep(350);
}

const posts = Array.from(candidates.values())
  .toSorted((a, b) => b.score + b.comments * 2 - (a.score + a.comments * 2))
  .slice(0, 20);

const rawItems = [];

for (const candidate of posts) {
  console.log(`Reading Reddit thread: ${candidate.title}`);
  try {
    const html = await fetchText(candidate.url);
    const post = parsePost(html, candidate);
    rawItems.push(post);
    rawItems.push(...parseComments(html, post));
  } catch (error) {
    console.warn(`Thread failed: ${error.message}`);
  }
  await sleep(450);
}

const signals = [];
const seen = new Set();

for (const item of rawItems) {
  if (!item.tickers.length) continue;
  if (!item.aiMentioned) continue;
  if (item.score + item.comments * 2 < 8) continue;

  for (const ticker of item.tickers.slice(0, 3)) {
    const signal = signalFromItem(item, ticker);
    if (seen.has(signal.id)) continue;
    seen.add(signal.id);
    signals.push(signal);
  }
}

signals.sort((a, b) => b.likes + b.replies * 2 - (a.likes + a.replies * 2));

const payload = {
  generatedAt: GENERATED_AT,
  source: "Public Reddit old.reddit.com search, top week, fetched without login",
  sourceUrls: posts.map((post) => post.url),
  searchedQueries: searchQueries,
  note: "Stocktwits public sentiment pages were reviewed separately, but the unauthenticated pages exposed N/A scores during this refresh, so they were not used as numeric inputs.",
  signals: signals.slice(0, 40),
};

await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

const byTicker = new Map();
for (const signal of payload.signals) {
  const current = byTicker.get(signal.ticker) || { count: 0, engagement: 0 };
  current.count += 1;
  current.engagement += signal.likes + signal.replies * 2;
  byTicker.set(signal.ticker, current);
}

console.log(`Wrote ${payload.signals.length} signals to ${path.relative(root, outputPath)}`);
console.table(
  Array.from(byTicker, ([ticker, data]) => ({ ticker, ...data }))
    .toSorted((a, b) => b.engagement - a.engagement)
    .slice(0, 10),
);
