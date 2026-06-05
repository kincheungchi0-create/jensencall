const state = {
  rows: [],
  filter: "all",
  firm: "all",
  search: "",
  socialSignals: [],
  remoteSocialSignals: [],
  localSocialSignals: [],
  socialMeta: null,
  muSignals: [],
  muMeta: null,
  attentionThreshold: 35,
  emotionThreshold: 25,
};

const SOCIAL_STORAGE_KEY = "jensencall:socialSignals:v1";
const SOCIAL_DATA_URL = "social_ai_signals.json";
const MU_DATA_URL = "mu_social_sentiment.json";

const aiStocks = [
  { ticker: "NVDA", company: "NVIDIA", theme: "AI accelerators" },
  { ticker: "GOOGL", company: "Alphabet", theme: "Search and Gemini" },
  { ticker: "MSFT", company: "Microsoft", theme: "Copilot and Azure AI" },
  { ticker: "AMZN", company: "Amazon", theme: "AWS AI infrastructure" },
  { ticker: "META", company: "Meta Platforms", theme: "Open models and AI ads" },
  { ticker: "AVGO", company: "Broadcom", theme: "Custom AI silicon" },
  { ticker: "AMD", company: "Advanced Micro Devices", theme: "AI GPU challenger" },
  { ticker: "TSM", company: "Taiwan Semiconductor", theme: "AI chip foundry" },
  { ticker: "PLTR", company: "Palantir", theme: "Enterprise AI platform" },
  { ticker: "CRWV", company: "CoreWeave", theme: "AI cloud capacity" },
  { ticker: "MRVL", company: "Marvell Technology", theme: "AI networking and ASICs" },
  { ticker: "ARM", company: "Arm Holdings", theme: "AI edge compute" },
  { ticker: "COHR", company: "Coherent", theme: "Optical AI datacenter links" },
  { ticker: "SNPS", company: "Synopsys", theme: "AI chip design tools" },
  { ticker: "INTC", company: "Intel", theme: "AI turnaround and foundry" },
  { ticker: "MU", company: "Micron Technology", theme: "AI memory and HBM" },
  { ticker: "CRWD", company: "CrowdStrike", theme: "AI cybersecurity" },
  { ticker: "VRT", company: "Vertiv", theme: "AI datacenter power" },
  { ticker: "ORCL", company: "Oracle", theme: "Cloud AI capacity" },
  { ticker: "DELL", company: "Dell Technologies", theme: "AI servers" },
  { ticker: "SMCI", company: "Super Micro Computer", theme: "AI server supply chain" },
  { ticker: "HPE", company: "Hewlett Packard Enterprise", theme: "AI servers and networking" },
  { ticker: "ANET", company: "Arista Networks", theme: "AI datacenter networking" },
  { ticker: "ASML", company: "ASML", theme: "AI lithography supply chain" },
  { ticker: "AMAT", company: "Applied Materials", theme: "Semiconductor equipment" },
  { ticker: "LRCX", company: "Lam Research", theme: "Semiconductor equipment" },
  { ticker: "KLAC", company: "KLA", theme: "Semiconductor process control" },
  { ticker: "QCOM", company: "Qualcomm", theme: "Edge AI chips" },
  { ticker: "TXN", company: "Texas Instruments", theme: "Industrial AI chips" },
  { ticker: "NXPI", company: "NXP Semiconductors", theme: "Auto and edge AI chips" },
  { ticker: "MCHP", company: "Microchip Technology", theme: "Embedded AI chips" },
  { ticker: "MPWR", company: "Monolithic Power Systems", theme: "AI power management" },
  { ticker: "TER", company: "Teradyne", theme: "AI chip testing" },
  { ticker: "STM", company: "STMicroelectronics", theme: "European semiconductor AI exposure" },
  { ticker: "WDC", company: "Western Digital", theme: "AI storage demand" },
  { ticker: "STX", company: "Seagate Technology", theme: "AI storage demand" },
  { ticker: "IBM", company: "IBM", theme: "Enterprise AI" },
  { ticker: "AAPL", company: "Apple", theme: "On-device AI" },
  { ticker: "CRM", company: "Salesforce", theme: "Enterprise AI agents" },
  { ticker: "SNOW", company: "Snowflake", theme: "AI data cloud" },
  { ticker: "ADBE", company: "Adobe", theme: "Creative AI" },
  { ticker: "DDOG", company: "Datadog", theme: "AI observability" },
  { ticker: "MDB", company: "MongoDB", theme: "AI app database" },
  { ticker: "PANW", company: "Palo Alto Networks", theme: "AI cybersecurity" },
  { ticker: "ZS", company: "Zscaler", theme: "AI cybersecurity" },
  { ticker: "VST", company: "Vistra", theme: "AI datacenter power" },
  { ticker: "CEG", company: "Constellation Energy", theme: "AI datacenter power" },
  { ticker: "ETN", company: "Eaton", theme: "AI power equipment" },
  { ticker: "PWR", company: "Quanta Services", theme: "AI grid infrastructure" },
  { ticker: "GEV", company: "GE Vernova", theme: "AI power infrastructure" },
  { ticker: "NRG", company: "NRG Energy", theme: "AI power demand" },
  { ticker: "EQIX", company: "Equinix", theme: "AI data centers" },
  { ticker: "DLR", company: "Digital Realty", theme: "AI data centers" },
  { ticker: "NBIS", company: "Nebius Group", theme: "AI cloud capacity" },
  { ticker: "HUT", company: "Hut 8", theme: "AI infrastructure pivot" },
];

const positiveWords = [
  "accelerating",
  "backlog",
  "beat",
  "beats",
  "best",
  "breakout",
  "bull",
  "bullish",
  "buy",
  "buying",
  "calls",
  "cheap",
  "dominant",
  "future",
  "growth",
  "leader",
  "long",
  "margin",
  "moat",
  "outperform",
  "partnership",
  "record",
  "strong",
  "surging",
  "upside",
  "winner",
];

const negativeWords = [
  "bear",
  "bearish",
  "bubble",
  "capex",
  "collapse",
  "competition",
  "crash",
  "cut",
  "delay",
  "diluting",
  "disappoints",
  "dump",
  "expensive",
  "fml",
  "inventory",
  "lawsuit",
  "loss",
  "miss",
  "overvalued",
  "plunged",
  "risk",
  "rugpull",
  "sell",
  "short",
  "sinks",
  "slowdown",
  "smoked",
  "weak",
];

const emotionWords = [
  "amazing",
  "all in",
  "bagholder",
  "crazy",
  "crash",
  "crush",
  "diluting",
  "dominates",
  "epic",
  "explode",
  "fear",
  "fml",
  "fomo",
  "huge",
  "insane",
  "massive",
  "meltdown",
  "monster",
  "moon",
  "panic",
  "plunged",
  "rip",
  "rugpull",
  "sinks",
  "smoked",
  "wave",
  "wild",
];

const convictionWords = [
  "adding",
  "all in",
  "breakout",
  "buying",
  "calls",
  "conviction",
  "go up",
  "heloc",
  "hold",
  "loading",
  "long",
  "must own",
  "position",
  "target",
  "trim",
  "watch",
];

const riskWords = [
  "ban",
  "bubble",
  "capex",
  "china",
  "competition",
  "diluting",
  "disappoints",
  "export",
  "loss",
  "margin pressure",
  "plunged",
  "regulation",
  "rugpull",
  "saturation",
  "short",
  "sinks",
  "slowdown",
  "smoked",
  "valuation",
];

const labels = {
  date: "Date",
  firmModel: "Firm / Model",
  type: "Type",
  tradingDay: "Trading Day",
  googlD1: "GOOGL +1D",
  excessD1: "Excess vs QQQ",
  googlD5: "GOOGL +5D",
  note: "Note / Source",
};

const eventRows = document.querySelector("#eventRows");
const reactionChart = document.querySelector("#reactionChart");
const searchInput = document.querySelector("#searchInput");
const firmSelect = document.querySelector("#firmSelect");
const tabs = Array.from(document.querySelectorAll(".tab"));
const socialTicker = document.querySelector("#socialTicker");
const socialPlatform = document.querySelector("#socialPlatform");
const socialLikes = document.querySelector("#socialLikes");
const socialReplies = document.querySelector("#socialReplies");
const socialReposts = document.querySelector("#socialReposts");
const socialSource = document.querySelector("#socialSource");
const socialComment = document.querySelector("#socialComment");
const addSocialSignal = document.querySelector("#addSocialSignal");
const clearSocialSignals = document.querySelector("#clearSocialSignals");
const attentionThreshold = document.querySelector("#attentionThreshold");
const emotionThreshold = document.querySelector("#emotionThreshold");
const attentionThresholdValue = document.querySelector("#attentionThresholdValue");
const emotionThresholdValue = document.querySelector("#emotionThresholdValue");
const socialMatrix = document.querySelector("#socialMatrix");
const socialSignalFeed = document.querySelector("#socialSignalFeed");
const socialRefreshStamp = document.querySelector("#socialRefreshStamp");
const muRefreshStamp = document.querySelector("#muRefreshStamp");
const muSentimentScore = document.querySelector("#muSentimentScore");
const muAttentionScore = document.querySelector("#muAttentionScore");
const muEmotionScore = document.querySelector("#muEmotionScore");
const muQualifiedCount = document.querySelector("#muQualifiedCount");
const muSentimentChart = document.querySelector("#muSentimentChart");
const muSentimentFeed = document.querySelector("#muSentimentFeed");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  row.push(value);
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

function csvToObjects(text) {
  const [headers, ...rows] = parseCsv(text);
  const numericFields = new Set([
    "pre_close",
    "close_d0",
    "close_d1",
    "close_d3",
    "close_d5",
    "googl_d0",
    "googl_d1",
    "googl_d3",
    "googl_d5",
    "qqq_d1",
    "qqq_d3",
    "qqq_d5",
    "excess_d1",
    "excess_d3",
    "excess_d5",
  ]);

  return rows.map((row) => {
    const object = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
    for (const field of numericFields) {
      object[field] = object[field] === "" ? null : Number(object[field]);
    }
    return object;
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "n/a";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(2)}%`;
}

function average(values) {
  const usable = values.filter(Number.isFinite);
  if (!usable.length) return null;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function median(values) {
  const sorted = values.filter(Number.isFinite).toSorted((a, b) => a - b);
  if (!sorted.length) return null;
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[midpoint] : (sorted[midpoint - 1] + sorted[midpoint]) / 2;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function roundScore(value) {
  return Math.round(clamp(value));
}

function countLexicon(text, words) {
  return words.reduce((count, word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "gi");
    return count + (text.match(pattern) || []).length;
  }, 0);
}

function engagementScore(signal) {
  const likes = Number(signal.likes) || 0;
  const replies = Number(signal.replies) || 0;
  const reposts = Number(signal.reposts) || 0;
  const engagement = likes + replies * 2 + reposts * 3;
  return clamp(Math.log10(engagement + 1) * 34);
}

function scoreSignal(rawSignal) {
  const text = String(rawSignal.comment || "");
  const lower = text.toLowerCase();
  const positiveHits = countLexicon(lower, positiveWords);
  const negativeHits = countLexicon(lower, negativeWords);
  const emotionHits = countLexicon(lower, emotionWords);
  const convictionHits = countLexicon(lower, convictionWords);
  const riskHits = countLexicon(lower, riskWords);
  const exclamationBoost = Math.min(12, (text.match(/!/g) || []).length * 3);
  const letters = text.replace(/[^a-z]/gi, "");
  const upperLetters = text.replace(/[^A-Z]/g, "");
  const capsBoost = letters.length > 24 ? clamp((upperLetters.length / letters.length - 0.16) * 90) : 0;
  const cashtagBoost = /\$[A-Z]{1,5}\b/.test(text) ? 7 : 0;
  const lengthBoost = Math.min(16, Math.sqrt(text.length) * 1.15);

  const attention = roundScore(engagementScore(rawSignal) + lengthBoost + cashtagBoost);
  const emotion = roundScore(emotionHits * 17 + exclamationBoost + capsBoost + Math.min(12, Math.abs(positiveHits - negativeHits) * 4));
  const sentiment = roundScore(50 + (positiveHits - negativeHits) * 12 + convictionHits * 3 - riskHits * 5);
  const conviction = roundScore(convictionHits * 18 + cashtagBoost + Math.min(22, (Number(rawSignal.reposts) || 0) * 2));
  const risk = roundScore(riskHits * 17 + negativeHits * 6);
  const heat = roundScore(attention * 0.4 + emotion * 0.3 + conviction * 0.18 + Math.abs(sentiment - 50) * 0.24);

  return {
    ...rawSignal,
    createdAt: rawSignal.createdAt || new Date().toISOString(),
    attention,
    emotion,
    sentiment,
    conviction,
    risk,
    heat,
  };
}

function stockMeta(ticker) {
  return aiStocks.find((stock) => stock.ticker === ticker) || { ticker, company: ticker, theme: "AI stock" };
}

function safeSourceUrl(source) {
  if (!source) return "";
  try {
    const parsed = new URL(source);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

function isQualifiedSignal(signal) {
  return signal.attention >= state.attentionThreshold && signal.emotion >= state.emotionThreshold;
}

function syncSocialSignals() {
  state.socialSignals = [...state.remoteSocialSignals, ...state.localSocialSignals].map(scoreSignal);
}

function saveSocialSignals() {
  try {
    localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(state.localSocialSignals));
  } catch {
    // Storage can fail in private browsing; the live matrix still works for the current session.
  }
}

function loadSocialSignals() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SOCIAL_STORAGE_KEY) || "[]");
    state.localSocialSignals = Array.isArray(parsed) ? parsed.map(scoreSignal) : [];
  } catch {
    state.localSocialSignals = [];
  }
  syncSocialSignals();
}

function aggregateSocialSignals() {
  const grouped = new Map();

  for (const signal of state.socialSignals) {
    if (!grouped.has(signal.ticker)) {
      grouped.set(signal.ticker, []);
    }
    grouped.get(signal.ticker).push(signal);
  }

  return Array.from(grouped, ([ticker, signals]) => {
    const qualified = signals.filter(isQualifiedSignal);
    const totalEngagement = signals.reduce(
      (sum, signal) =>
        sum + (Number(signal.likes) || 0) + (Number(signal.replies) || 0) * 2 + (Number(signal.reposts) || 0) * 3,
      0,
    );
    const source = qualified.length ? qualified : signals;
    const heat = clamp(
      average(source.map((signal) => signal.heat)) * 0.76 +
        Math.min(24, Math.log10(totalEngagement + 1) * 7 + qualified.length * 4),
    );
    const sentiment = average(source.map((signal) => signal.sentiment));
    const meta = stockMeta(ticker);

    return {
      ticker,
      company: meta.company,
      theme: meta.theme,
      signals: signals.length,
      qualified: qualified.length,
      heat: roundScore(heat),
      attention: roundScore(average(source.map((signal) => signal.attention)) || 0),
      emotion: roundScore(average(source.map((signal) => signal.emotion)) || 0),
      sentiment: roundScore(sentiment || 50),
      conviction: roundScore(average(source.map((signal) => signal.conviction)) || 0),
      risk: roundScore(average(source.map((signal) => signal.risk)) || 0),
    };
  }).toSorted((a, b) => b.heat - a.heat || b.qualified - a.qualified || b.signals - a.signals);
}

function summarize(rows) {
  return {
    count: rows.length,
    avgD1: average(rows.map((row) => row.googl_d1)),
    medD1: median(rows.map((row) => row.googl_d1)),
    avgExcessD1: average(rows.map((row) => row.excess_d1)),
    positiveCount: rows.filter((row) => Number.isFinite(row.googl_d1) && row.googl_d1 > 0).length,
  };
}

function renderFirmOptions() {
  const firms = Array.from(new Set(state.rows.map((row) => row.firm))).sort((a, b) =>
    a.localeCompare(b),
  );
  firmSelect.innerHTML = [
    '<option value="all">All firms</option>',
    ...firms.map((firm) => `<option value="${escapeHtml(firm)}">${escapeHtml(firm)}</option>`),
  ].join("");
}

function renderSocialTickerOptions() {
  socialTicker.innerHTML = aiStocks
    .map(
      (stock) =>
        `<option value="${escapeHtml(stock.ticker)}">${escapeHtml(stock.ticker)} - ${escapeHtml(stock.company)}</option>`,
    )
    .join("");
}

function matchesFilter(row) {
  if (state.filter === "google") return row.type === "Google";
  if (state.filter === "competitor") return row.type === "Competitor";
  if (state.filter === "positive") return row.googl_d1 > 0;
  if (state.filter === "negative") return row.googl_d1 < 0;
  return true;
}

function matchesFirm(row) {
  return state.firm === "all" || row.firm === state.firm;
}

function matchesSearch(row) {
  if (!state.search) return true;
  const haystack = Object.values(row).join(" ").toLowerCase();
  return haystack.includes(state.search);
}

function filteredRows() {
  return state.rows.filter(matchesFilter).filter(matchesFirm).filter(matchesSearch);
}

function renderMetrics() {
  const all = summarize(state.rows);
  const google = summarize(state.rows.filter((row) => row.type === "Google"));
  const competitors = summarize(state.rows.filter((row) => row.type === "Competitor"));

  document.querySelector("#totalEvents").textContent = all.count;
  document.querySelector("#medianD1").textContent = formatPercent(all.medD1);
  document.querySelector("#googleAvg").textContent = formatPercent(google.avgD1);
  document.querySelector("#competitorAvg").textContent = formatPercent(competitors.avgD1);

  document.querySelector("#overallInsight").textContent =
    `整體 +1D 平均 ${formatPercent(all.avgD1)}，中位數 ${formatPercent(all.medD1)}`;
  document.querySelector("#googleInsight").textContent =
    `Google 事件平均 ${formatPercent(google.avgD1)}，相對 QQQ ${formatPercent(google.avgExcessD1)}`;
  document.querySelector("#competitorInsight").textContent =
    `競品事件平均 ${formatPercent(competitors.avgD1)}，相對 QQQ ${formatPercent(competitors.avgExcessD1)}`;
}

function renderSocialMetrics(aggregates) {
  const hot = aggregates[0];
  const qualifiedCount = state.socialSignals.filter(isQualifiedSignal).length;

  document.querySelector("#socialSignalCount").textContent = state.socialSignals.length;
  document.querySelector("#socialQualifiedCount").textContent = qualifiedCount;

  if (!hot) {
    document.querySelector("#socialHotTicker").textContent = "-";
    document.querySelector("#socialHotCompany").textContent = "Awaiting signals";
    document.querySelector("#socialHotScore").textContent = "-";
    return;
  }

  document.querySelector("#socialHotTicker").textContent = hot.ticker;
  document.querySelector("#socialHotCompany").textContent = hot.company;
  document.querySelector("#socialHotScore").textContent = hot.heat;
}

function scoreLine(label, value, className = "") {
  return `
    <div class="score-line">
      <span>${label}</span>
      <div class="score-track"><span class="score-fill ${className}" style="width: ${clamp(value)}%"></span></div>
      <strong>${roundScore(value)}</strong>
    </div>
  `;
}

function renderSocialMatrix() {
  const aggregates = aggregateSocialSignals();
  renderSocialMetrics(aggregates);

  if (!aggregates.length) {
    socialMatrix.innerHTML = '<div class="empty-state">No social signals yet</div>';
    return;
  }

  socialMatrix.innerHTML = aggregates
    .slice(0, 12)
    .map(
      (item) => `
        <article class="matrix-card">
          <div class="matrix-head">
            <div>
              <span>${escapeHtml(item.theme)}</span>
              <strong>${escapeHtml(item.ticker)}</strong>
              <div class="matrix-company">${escapeHtml(item.company)}</div>
            </div>
            <div class="heat-badge">${item.heat}</div>
          </div>
          <div class="matrix-bars">
            ${scoreLine("Attention", item.attention)}
            ${scoreLine("Emotion", item.emotion, "emotion")}
            ${scoreLine("Sentiment", item.sentiment, "sentiment")}
            ${scoreLine("Risk", item.risk, "risk")}
          </div>
          <div class="matrix-stats">
            <span>${item.signals} signals</span>
            <span>${item.qualified} qualified</span>
            <span>${item.conviction} conviction</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderSocialFeed() {
  const qualified = state.socialSignals
    .filter(isQualifiedSignal)
    .toSorted((a, b) => b.heat - a.heat || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 16);

  if (!qualified.length) {
    socialSignalFeed.innerHTML = '<div class="empty-state">No qualified comments</div>';
    return;
  }

  socialSignalFeed.innerHTML = qualified
    .map((signal) => {
      const sourceUrl = safeSourceUrl(signal.source);
      const source = sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">Source</a>` : "";
      const sourceLabel = signal.sourceLabel || signal.subreddit || signal.platform;
      return `
        <article class="feed-card">
          <div class="feed-meta">
            <strong>${escapeHtml(signal.ticker)}</strong>
            <span>${escapeHtml(signal.platform)}</span>
            <span>${escapeHtml(sourceLabel)}</span>
            <span>Heat ${signal.heat}</span>
            <span>Attention ${signal.attention}</span>
            <span>Emotion ${signal.emotion}</span>
            <span>Sentiment ${signal.sentiment}</span>
          </div>
          <p>${escapeHtml(signal.comment)}</p>
          ${source}
        </article>
      `;
    })
    .join("");
}

function formatRefreshTime(isoValue) {
  if (!isoValue) return "";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderSocialRefreshStamp() {
  if (!socialRefreshStamp) return;

  if (state.socialMeta?.generatedAt) {
    const timestamp = formatRefreshTime(state.socialMeta.generatedAt);
    socialRefreshStamp.textContent =
      `Auto refreshed ${timestamp} · ${state.remoteSocialSignals.length} public Reddit signals`;
    return;
  }

  if (state.socialMeta?.error) {
    socialRefreshStamp.textContent = "Public refresh unavailable · manual tracker still active";
    return;
  }

  socialRefreshStamp.textContent = "Loading public social refresh...";
}

function renderSocialSentiment() {
  attentionThresholdValue.textContent = state.attentionThreshold;
  emotionThresholdValue.textContent = state.emotionThreshold;
  renderSocialRefreshStamp();
  renderSocialMatrix();
  renderSocialFeed();
}

function signalEngagement(signal) {
  return (Number(signal.likes) || 0) + (Number(signal.replies) || 0) * 2 + (Number(signal.reposts) || 0) * 3;
}

function sentimentTone(score) {
  if (score >= 62) return { label: "Bullish", className: "bullish" };
  if (score <= 42) return { label: "Bearish", className: "bearish" };
  return { label: "Neutral", className: "" };
}

function scoreText(values, fallback = "-") {
  const value = average(values);
  return value === null ? fallback : String(roundScore(value));
}

function renderMuRefreshStamp() {
  if (!muRefreshStamp) return;

  if (state.muMeta?.generatedAt) {
    const timestamp = formatRefreshTime(state.muMeta.generatedAt);
    muRefreshStamp.textContent = `MU refreshed ${timestamp} · ${state.muSignals.length} public Reddit posts`;
    return;
  }

  if (state.muMeta?.error) {
    muRefreshStamp.textContent = "MU refresh unavailable";
    return;
  }

  muRefreshStamp.textContent = "Loading MU sentiment...";
}

function renderMuSentiment() {
  if (!muSentimentChart || !muSentimentFeed) return;

  renderMuRefreshStamp();

  const signals = state.muSignals;
  const qualified = signals.filter(isQualifiedSignal);
  const scoreBase = qualified.length ? qualified : signals;

  muSentimentScore.textContent = scoreText(scoreBase.map((signal) => signal.sentiment));
  muAttentionScore.textContent = scoreText(scoreBase.map((signal) => signal.attention));
  muEmotionScore.textContent = scoreText(scoreBase.map((signal) => signal.emotion));
  muQualifiedCount.textContent = `${qualified.length}/${signals.length}`;

  if (!signals.length) {
    muSentimentChart.innerHTML = '<div class="empty-state">No MU social signals yet</div>';
    muSentimentFeed.innerHTML = '<div class="empty-state">No MU feed yet</div>';
    return;
  }

  const rankedSignals = signals.toSorted(
    (a, b) => b.heat - a.heat || signalEngagement(b) - signalEngagement(a) || b.createdAt.localeCompare(a.createdAt),
  );

  muSentimentChart.innerHTML = rankedSignals
    .slice(0, 14)
    .map((signal) => {
      const tone = sentimentTone(signal.sentiment);
      const sourceLabel = signal.sourceLabel || signal.subreddit || signal.platform;
      const sourceTitle = signal.sourceTitle || signal.comment.slice(0, 90);
      const createdAt = formatRefreshTime(signal.createdAt);

      return `
        <article class="mu-chart-row">
          <div class="mu-chart-meta">
            <span>${escapeHtml([sourceLabel, createdAt].filter(Boolean).join(" · "))}</span>
            <strong>${escapeHtml(sourceTitle)}</strong>
          </div>
          <div class="mu-chart-bar">
            <div class="mu-chart-track" aria-label="${escapeHtml(sourceTitle)} sentiment ${signal.sentiment}">
              <span class="mu-chart-fill ${tone.className}" style="width: ${clamp(signal.sentiment)}%"></span>
            </div>
            <span>${tone.label} sentiment ${signal.sentiment}</span>
          </div>
          <div class="mu-chart-values">
            <span>Attn ${signal.attention}</span>
            <span>Emo ${signal.emotion}</span>
            <span>Heat ${signal.heat}</span>
          </div>
        </article>
      `;
    })
    .join("");

  muSentimentFeed.innerHTML = rankedSignals
    .slice(0, 6)
    .map((signal) => {
      const sourceUrl = safeSourceUrl(signal.source);
      const source = sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">Source</a>` : "";
      const sourceLabel = signal.sourceLabel || signal.subreddit || signal.platform;

      return `
        <article class="feed-card">
          <div class="feed-meta">
            <strong>MU</strong>
            <span>${escapeHtml(sourceLabel)}</span>
            <span>Heat ${signal.heat}</span>
            <span>Sentiment ${signal.sentiment}</span>
            <span>Attention ${signal.attention}</span>
            <span>Emotion ${signal.emotion}</span>
          </div>
          <p>${escapeHtml(signal.comment)}</p>
          ${source}
        </article>
      `;
    })
    .join("");
}

function renderChart() {
  const rows = filteredRows().toSorted((a, b) => a.date.localeCompare(b.date));

  if (!rows.length) {
    reactionChart.innerHTML = '<div class="empty-state">No matching events</div>';
    return;
  }

  const maxAbs = Math.max(0.06, ...rows.map((row) => Math.abs(row.googl_d1 || 0)));

  reactionChart.innerHTML = rows
    .map((row) => {
      const value = Number.isFinite(row.googl_d1) ? row.googl_d1 : 0;
      const width = Math.min(50, (Math.abs(value) / maxAbs) * 50);
      const isPositive = value >= 0;
      const barStyle = isPositive
        ? `left: 50%; width: ${width}%;`
        : `right: 50%; width: ${width}%;`;

      return `
        <article class="chart-row">
          <div class="chart-meta">
            <span>${escapeHtml(row.date)}</span>
            <strong>${escapeHtml(row.firm)} / ${escapeHtml(row.model)}</strong>
          </div>
          <div class="bar-track" aria-label="${escapeHtml(row.model)} ${formatPercent(row.googl_d1)}">
            <span class="zero-line"></span>
            <span class="bar ${isPositive ? "positive" : "negative"}" style="${barStyle}"></span>
          </div>
          <div class="chart-value ${isPositive ? "positive-text" : "negative-text"}">
            ${formatPercent(row.googl_d1)}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderTable() {
  const rows = filteredRows().toSorted((a, b) => b.date.localeCompare(a.date));

  if (!rows.length) {
    eventRows.innerHTML = '<tr class="empty-row"><td colspan="8">No matching events</td></tr>';
    return;
  }

  eventRows.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td class="date" data-label="${labels.date}">${escapeHtml(row.date)}</td>
          <td class="firm-model" data-label="${labels.firmModel}">
            <strong>${escapeHtml(row.firm)}</strong>
            <span>${escapeHtml(row.model)}</span>
          </td>
          <td class="type" data-label="${labels.type}">
            <span class="pill ${row.type === "Google" ? "google" : "competitor"}">${escapeHtml(row.type)}</span>
          </td>
          <td class="trading-day" data-label="${labels.tradingDay}">${escapeHtml(row.trading_day)}</td>
          <td class="return ${row.googl_d1 >= 0 ? "positive-text" : "negative-text"}" data-label="${labels.googlD1}">
            ${formatPercent(row.googl_d1)}
          </td>
          <td class="return ${row.excess_d1 >= 0 ? "positive-text" : "negative-text"}" data-label="${labels.excessD1}">
            ${formatPercent(row.excess_d1)}
          </td>
          <td class="return ${row.googl_d5 >= 0 ? "positive-text" : "negative-text"}" data-label="${labels.googlD5}">
            ${formatPercent(row.googl_d5)}
          </td>
          <td class="note" data-label="${labels.note}">
            <span>${escapeHtml(row.note)}</span>
            <a href="${escapeHtml(row.source)}" target="_blank" rel="noreferrer">Source</a>
          </td>
        </tr>
      `,
    )
    .join("");
}

function render() {
  renderMetrics();
  renderSocialSentiment();
  renderMuSentiment();
  renderChart();
  renderTable();
}

function makeSignalId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readNumber(input) {
  return Math.max(0, Number(input.value) || 0);
}

function addSignalFromForm() {
  const comment = socialComment.value.trim();
  if (!comment) {
    socialComment.focus();
    return;
  }

  const signal = scoreSignal({
    id: makeSignalId(),
    ticker: socialTicker.value,
    platform: socialPlatform.value,
    likes: readNumber(socialLikes),
    replies: readNumber(socialReplies),
    reposts: readNumber(socialReposts),
    source: socialSource.value.trim(),
    comment,
    createdAt: new Date().toISOString(),
  });

  state.localSocialSignals.unshift(signal);
  syncSocialSignals();
  saveSocialSignals();

  socialComment.value = "";
  socialSource.value = "";
  socialLikes.value = "0";
  socialReplies.value = "0";
  socialReposts.value = "0";
  renderSocialSentiment();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.filter = tab.dataset.filter;
    tabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });
    render();
  });
});

firmSelect.addEventListener("change", (event) => {
  state.firm = event.target.value;
  render();
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value.trim().toLowerCase();
  render();
});

addSocialSignal.addEventListener("click", addSignalFromForm);

clearSocialSignals.addEventListener("click", () => {
  if (!state.localSocialSignals.length) return;
  if (!window.confirm("Clear manual social signals?")) return;
  state.localSocialSignals = [];
  syncSocialSignals();
  saveSocialSignals();
  renderSocialSentiment();
});

attentionThreshold.addEventListener("input", (event) => {
  state.attentionThreshold = Number(event.target.value);
  renderSocialSentiment();
  renderMuSentiment();
});

emotionThreshold.addEventListener("input", (event) => {
  state.emotionThreshold = Number(event.target.value);
  renderSocialSentiment();
  renderMuSentiment();
});

renderSocialTickerOptions();
loadSocialSignals();
renderSocialSentiment();
renderMuSentiment();

fetch(SOCIAL_DATA_URL)
  .then((response) => {
    if (!response.ok) throw new Error(`Social refresh failed: ${response.status}`);
    return response.json();
  })
  .then((payload) => {
    state.socialMeta = payload;
    state.remoteSocialSignals = Array.isArray(payload.signals) ? payload.signals.map(scoreSignal) : [];
    syncSocialSignals();
    renderSocialSentiment();
  })
  .catch((error) => {
    state.socialMeta = { error: error.message };
    renderSocialSentiment();
  });

fetch(MU_DATA_URL)
  .then((response) => {
    if (!response.ok) throw new Error(`MU refresh failed: ${response.status}`);
    return response.json();
  })
  .then((payload) => {
    state.muMeta = payload;
    state.muSignals = Array.isArray(payload.signals) ? payload.signals.map(scoreSignal) : [];
    renderMuSentiment();
  })
  .catch((error) => {
    state.muMeta = { error: error.message };
    state.muSignals = [];
    renderMuSentiment();
  });

fetch("ai_model_google_reaction.csv")
  .then((response) => {
    if (!response.ok) throw new Error(`CSV request failed: ${response.status}`);
    return response.text();
  })
  .then((text) => {
    state.rows = csvToObjects(text);
    renderFirmOptions();
    render();
  })
  .catch((error) => {
    eventRows.innerHTML = `<tr><td colspan="8">${escapeHtml(error.message)}</td></tr>`;
    reactionChart.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  });
