import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), "..");
const execFileAsync = promisify(execFile);

const START_DATE = "2022-11-01";
const END_DATE = "2026-06-03";

const events = [
  {
    date: "2022-11-30",
    firm: "OpenAI",
    model: "ChatGPT research release",
    type: "Competitor",
    source:
      "https://openai.com/index/chatgpt/",
    note: "The launch that started the consumer AI race and raised search-disruption concerns.",
  },
  {
    date: "2023-02-06",
    firm: "Google",
    model: "Bard / LaMDA announcement",
    type: "Google",
    source:
      "https://blog.google/technology/ai/bard-google-ai-search-updates/",
    note: "Google's first major public response to ChatGPT; the later Feb. 8 demo amplified selling pressure.",
  },
  {
    date: "2023-02-24",
    firm: "Meta",
    model: "LLaMA",
    type: "Competitor",
    source:
      "https://ai.meta.com/blog/large-language-model-llama-meta-ai/",
    note: "Research release of Meta's foundational LLaMA model family.",
  },
  {
    date: "2023-03-14",
    firm: "OpenAI",
    model: "GPT-4",
    type: "Competitor",
    source: "https://openai.com/research/gpt-4",
    note: "Major capability jump; direct benchmark pressure on Google's AI roadmap.",
  },
  {
    date: "2023-07-11",
    firm: "Anthropic",
    model: "Claude 2",
    type: "Competitor",
    source: "https://www.anthropic.com/news/claude-2",
    note: "Anthropic's second-generation chatbot and API model.",
  },
  {
    date: "2023-07-18",
    firm: "Meta",
    model: "Llama 2",
    type: "Competitor",
    source: "https://ai.meta.com/blog/llama-2/",
    note: "Commercially usable open-weight model released with Microsoft as preferred partner.",
  },
  {
    date: "2023-12-06",
    firm: "Google",
    model: "Gemini 1.0",
    type: "Google",
    source: "https://blog.google/innovation-and-ai/technology/ai/google-gemini-ai/",
    note: "First Gemini family launch; Google's strongest direct answer to GPT-4.",
  },
  {
    date: "2023-12-11",
    firm: "Mistral AI",
    model: "Mixtral 8x7B",
    type: "Competitor",
    source: "https://mistral.ai/news/mixtral-of-experts",
    note: "Sparse mixture-of-experts open-weight model.",
  },
  {
    date: "2024-02-15",
    firm: "Google",
    model: "Gemini 1.5",
    type: "Google",
    source: "https://blog.google/technology/ai/google-gemini-next-generation-model-february-2024/",
    note: "Next-generation Gemini model with long-context emphasis.",
  },
  {
    date: "2024-02-26",
    firm: "Mistral AI",
    model: "Mistral Large",
    type: "Competitor",
    source: "https://mistral.ai/en/news/mistral-large",
    note: "Flagship proprietary model and Le Chat launch window.",
  },
  {
    date: "2024-03-04",
    firm: "Anthropic",
    model: "Claude 3 family",
    type: "Competitor",
    source: "https://www.anthropic.com/news/claude-3-family",
    note: "Opus, Sonnet, and Haiku family launch with strong benchmark claims.",
  },
  {
    date: "2024-04-18",
    firm: "Meta",
    model: "Llama 3",
    type: "Competitor",
    source: "https://ai.meta.com/blog/meta-llama-3/",
    note: "Open-weight Llama 3 release and Meta AI assistant update.",
  },
  {
    date: "2024-05-13",
    firm: "OpenAI",
    model: "GPT-4o",
    type: "Competitor",
    source: "https://openai.com/index/hello-gpt-4o/",
    note: "Omnimodal flagship model with faster text, vision, and voice interaction.",
  },
  {
    date: "2024-06-20",
    firm: "Anthropic",
    model: "Claude 3.5 Sonnet",
    type: "Competitor",
    source: "https://www.anthropic.com/news/claude-3-5-sonnet",
    note: "Anthropic's first Claude 3.5 model; strong coding and analysis positioning.",
  },
  {
    date: "2024-07-23",
    firm: "Meta",
    model: "Llama 3.1 405B",
    type: "Competitor",
    source: "https://ai.meta.com/blog/meta-llama-3-1/",
    note: "Meta's largest openly available model at release.",
  },
  {
    date: "2024-08-13",
    firm: "xAI",
    model: "Grok-2 beta",
    type: "Competitor",
    source: "https://x.ai/news/grok-2",
    note: "Grok model update with text and vision capabilities.",
  },
  {
    date: "2024-09-12",
    firm: "OpenAI",
    model: "o1-preview",
    type: "Competitor",
    source: "https://openai.com/index/introducing-openai-o1-preview/",
    note: "First OpenAI reasoning-model preview.",
  },
  {
    date: "2024-12-11",
    firm: "Google",
    model: "Gemini 2.0",
    type: "Google",
    source:
      "https://blog.google/innovation-and-ai/models-and-research/google-deepmind/google-gemini-ai-update-december-2024/",
    note: "Agentic-era Gemini release.",
  },
  {
    date: "2025-01-20",
    firm: "DeepSeek",
    model: "DeepSeek-R1",
    type: "Competitor",
    source: "https://api-docs.deepseek.com/news/news250120",
    note: "Official R1 release date; US market was closed, and broader market reaction concentrated around Jan. 27.",
  },
  {
    date: "2025-01-27",
    firm: "DeepSeek",
    model: "DeepSeek-R1 market digestion",
    type: "Competitor",
    source: "https://api-docs.deepseek.com/news/news250120",
    note: "Included separately because US equities repriced AI infrastructure risk after R1 gained global attention.",
  },
  {
    date: "2025-02-19",
    firm: "xAI",
    model: "Grok 3",
    type: "Competitor",
    source: "https://x.ai/news/grok-3",
    note: "Flagship Grok release and DeepSearch capabilities.",
  },
  {
    date: "2025-02-24",
    firm: "Anthropic",
    model: "Claude 3.7 Sonnet",
    type: "Competitor",
    source: "https://www.anthropic.com/news/claude-3-7-sonnet",
    note: "Hybrid reasoning model release.",
  },
  {
    date: "2025-02-27",
    firm: "OpenAI",
    model: "GPT-4.5",
    type: "Competitor",
    source: "https://openai.com/index/introducing-gpt-4-5/",
    note: "Research preview of OpenAI's largest GPT model at the time.",
  },
  {
    date: "2025-03-17",
    firm: "Mistral AI",
    model: "Mistral Small 3.1",
    type: "Competitor",
    source: "https://mistral.ai/en/news/mistral-small-3-1",
    note: "Open multimodal small model release.",
  },
  {
    date: "2025-03-25",
    firm: "Google",
    model: "Gemini 2.5 Pro",
    type: "Google",
    source: "https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/",
    note: "Experimental thinking-model release.",
  },
  {
    date: "2025-04-05",
    firm: "Meta",
    model: "Llama 4",
    type: "Competitor",
    source: "https://ai.meta.com/blog/llama-4-multimodal-intelligence/",
    note: "Open-weight natively multimodal Llama 4 Scout and Maverick announcement.",
  },
  {
    date: "2025-04-14",
    firm: "OpenAI",
    model: "GPT-4.1 API",
    type: "Competitor",
    source: "https://openai.com/index/gpt-4-1/",
    note: "API model series focused on coding, instruction following, and long context.",
  },
  {
    date: "2025-04-16",
    firm: "OpenAI",
    model: "o3 and o4-mini",
    type: "Competitor",
    source: "https://openai.com/index/introducing-o3-and-o4-mini/",
    note: "OpenAI's next o-series reasoning models.",
  },
  {
    date: "2025-05-07",
    firm: "Mistral AI",
    model: "Mistral Medium 3",
    type: "Competitor",
    source: "https://mistral.ai/news/mistral-medium-3",
    note: "Enterprise-focused multimodal model release.",
  },
  {
    date: "2025-05-22",
    firm: "Anthropic",
    model: "Claude 4",
    type: "Competitor",
    source: "https://www.anthropic.com/news/claude-4",
    note: "Claude Opus 4 and Sonnet 4 launch.",
  },
  {
    date: "2025-07-09",
    firm: "xAI",
    model: "Grok 4",
    type: "Competitor",
    source: "https://x.ai/news/grok-4",
    note: "Flagship Grok 4 release.",
  },
  {
    date: "2025-08-07",
    firm: "OpenAI",
    model: "GPT-5",
    type: "Competitor",
    source: "https://openai.com/index/introducing-gpt-5/",
    note: "OpenAI's unified GPT-5 release.",
  },
  {
    date: "2025-09-29",
    firm: "Anthropic",
    model: "Claude Sonnet 4.5",
    type: "Competitor",
    source: "https://www.anthropic.com/news/claude-sonnet-4-5",
    note: "Agentic coding and computer-use-focused Sonnet release.",
  },
  {
    date: "2025-11-18",
    firm: "Google",
    model: "Gemini 3",
    type: "Google",
    source: "https://blog.google/products/gemini/gemini-3/",
    note: "Gemini 3 Pro and same-day Search, app, developer, and enterprise rollout.",
  },
  {
    date: "2026-02-12",
    firm: "Google",
    model: "Gemini 3 Deep Think",
    type: "Google",
    source:
      "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-deep-think/",
    note: "Deep Think reasoning-mode upgrade for science and engineering workloads.",
  },
  {
    date: "2026-03-05",
    firm: "OpenAI",
    model: "GPT-5.4",
    type: "Competitor",
    source: "https://openai.com/index/introducing-gpt-5-4/",
    note: "General-purpose frontier model with computer-use capabilities.",
  },
  {
    date: "2026-04-16",
    firm: "Anthropic",
    model: "Claude Opus 4.7",
    type: "Competitor",
    source: "https://www.anthropic.com/news/claude-opus-4-7",
    note: "Opus upgrade focused on coding, agents, vision, and multi-step tasks.",
  },
  {
    date: "2026-04-16",
    firm: "OpenAI",
    model: "GPT-Rosalind",
    type: "Competitor",
    source: "https://openai.com/index/introducing-gpt-rosalind/",
    note: "Purpose-built life sciences reasoning model.",
  },
  {
    date: "2026-05-19",
    firm: "Google",
    model: "Gemini 3.5 Flash",
    type: "Google",
    source:
      "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/",
    note: "I/O 2026 model family launch focused on frontier intelligence with action.",
  },
  {
    date: "2026-05-28",
    firm: "Anthropic",
    model: "Claude Opus 4.8",
    type: "Competitor",
    source: "https://www.anthropic.com/claude/opus",
    note: "Latest Opus model listed as stronger across coding, agentic tasks, and professional work.",
  },
];

function toUnix(date) {
  return Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000);
}

function pct(value) {
  return Number.isFinite(value) ? `${(value * 100).toFixed(2)}%` : "";
}

function fixed(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "";
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

async function fetchChart(symbol) {
  const period1 = toUnix(START_DATE);
  const period2 = toUnix(new Date(new Date(`${END_DATE}T00:00:00Z`).getTime() + 86400000).toISOString().slice(0, 10));
  const urls = ["query1", "query2"].flatMap((host) => {
    const periodUrl = new URL(`https://${host}.finance.yahoo.com/v8/finance/chart/${symbol}`);
    periodUrl.searchParams.set("period1", String(period1));
    periodUrl.searchParams.set("period2", String(period2));
    periodUrl.searchParams.set("interval", "1d");
    periodUrl.searchParams.set("events", "history");
    periodUrl.searchParams.set("includeAdjustedClose", "true");

    const rangeUrl = new URL(`https://${host}.finance.yahoo.com/v8/finance/chart/${symbol}`);
    rangeUrl.searchParams.set("range", "5y");
    rangeUrl.searchParams.set("interval", "1d");
    rangeUrl.searchParams.set("events", "history");
    rangeUrl.searchParams.set("includeAdjustedClose", "true");

    return [periodUrl.toString(), rangeUrl.toString()];
  });

  let stdout = "";
  let lastError = "";
  for (const url of urls) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        ({ stdout } = await execFileAsync(
          "curl",
          [
            "-L",
            "--fail",
            "--silent",
            "--show-error",
            "--max-time",
            "30",
            "-A",
            "Mozilla/5.0",
            url,
          ],
          { maxBuffer: 20 * 1024 * 1024 },
        ));
        lastError = "";
        break;
      } catch (error) {
        lastError = error.stderr || error.message;
        await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
      }
    }
    if (stdout) break;
  }

  if (!stdout) throw new Error(`Unable to fetch Yahoo chart for ${symbol}: ${lastError}`);
  const payload = JSON.parse(stdout);
  const result = payload.chart?.result?.[0];
  if (!result) throw new Error(`Yahoo returned no chart result for ${symbol}`);

  const timestamps = result.timestamp ?? [];
  const closes = result.indicators?.adjclose?.[0]?.adjclose ?? result.indicators?.quote?.[0]?.close ?? [];
  return timestamps
    .map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      close: closes[index],
    }))
    .filter((row) => Number.isFinite(row.close));
}

function findIndexOnOrAfter(rows, date) {
  const index = rows.findIndex((row) => row.date >= date);
  if (index < 1) throw new Error(`No usable trading date on or after ${date}`);
  return index;
}

function returnFrom(rows, preIndex, eventIndex, offset) {
  const target = rows[eventIndex + offset];
  if (!target) return null;
  return target.close / rows[preIndex].close - 1;
}

function median(values) {
  const sorted = values.filter(Number.isFinite).toSorted((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function average(values) {
  const usable = values.filter(Number.isFinite);
  if (!usable.length) return null;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function summarize(rows, predicate) {
  const group = rows.filter(predicate);
  return {
    count: group.length,
    avgD1: average(group.map((row) => row.googl_d1)),
    medD1: median(group.map((row) => row.googl_d1)),
    avgExcessD1: average(group.map((row) => row.excess_d1)),
    avgD5: average(group.map((row) => row.googl_d5)),
    winRateD1:
      group.filter((row) => Number.isFinite(row.googl_d1) && row.googl_d1 > 0).length /
      group.filter((row) => Number.isFinite(row.googl_d1)).length,
  };
}

function bestAndWorst(rows, field) {
  const usable = rows.filter((row) => Number.isFinite(row[field]));
  return {
    best: usable.toSorted((a, b) => b[field] - a[field])[0],
    worst: usable.toSorted((a, b) => a[field] - b[field])[0],
  };
}

const googl = await fetchChart("GOOGL");
const qqq = await fetchChart("QQQ");

const enriched = events.map((event) => {
  const eventIndex = findIndexOnOrAfter(googl, event.date);
  const qqqIndex = findIndexOnOrAfter(qqq, event.date);
  const preIndex = eventIndex - 1;
  const qqqPreIndex = qqqIndex - 1;
  const googlD0 = returnFrom(googl, preIndex, eventIndex, 0);
  const googlD1 = returnFrom(googl, preIndex, eventIndex, 1);
  const googlD3 = returnFrom(googl, preIndex, eventIndex, 3);
  const googlD5 = returnFrom(googl, preIndex, eventIndex, 5);
  const qqqD1 = returnFrom(qqq, qqqPreIndex, qqqIndex, 1);
  const qqqD3 = returnFrom(qqq, qqqPreIndex, qqqIndex, 3);
  const qqqD5 = returnFrom(qqq, qqqPreIndex, qqqIndex, 5);

  return {
    ...event,
    trading_day: googl[eventIndex].date,
    pre_close: googl[preIndex].close,
    close_d0: googl[eventIndex].close,
    close_d1: googl[eventIndex + 1]?.close,
    close_d3: googl[eventIndex + 3]?.close,
    close_d5: googl[eventIndex + 5]?.close,
    googl_d0: googlD0,
    googl_d1: googlD1,
    googl_d3: googlD3,
    googl_d5: googlD5,
    qqq_d1: qqqD1,
    qqq_d3: qqqD3,
    qqq_d5: qqqD5,
    excess_d1: Number.isFinite(googlD1) && Number.isFinite(qqqD1) ? googlD1 - qqqD1 : null,
    excess_d3: Number.isFinite(googlD3) && Number.isFinite(qqqD3) ? googlD3 - qqqD3 : null,
    excess_d5: Number.isFinite(googlD5) && Number.isFinite(qqqD5) ? googlD5 - qqqD5 : null,
  };
});

const headers = [
  "date",
  "trading_day",
  "firm",
  "model",
  "type",
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
  "source",
  "note",
];

const csv = [
  headers.join(","),
  ...enriched.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        return typeof value === "number" ? String(value) : csvEscape(value);
      })
      .join(","),
  ),
].join("\n");

const all = summarize(enriched, () => true);
const google = summarize(enriched, (row) => row.type === "Google");
const competitors = summarize(enriched, (row) => row.type === "Competitor");
const openai = summarize(enriched, (row) => row.firm === "OpenAI");
const { best, worst } = bestAndWorst(enriched, "googl_d1");
const { best: bestExcess, worst: worstExcess } = bestAndWorst(enriched, "excess_d1");

const markdown = `# AI model release event study: Alphabet (GOOGL)

Generated: ${END_DATE}

## Method

- Event universe: selected major AI model or AI assistant/model-family releases from OpenAI, Google, Anthropic, Meta, Mistral AI, xAI, and DeepSeek.
- Price proxy: Alphabet Class A shares (GOOGL), adjusted close from Yahoo Finance chart data.
- Market proxy: Invesco QQQ Trust (QQQ), adjusted close from Yahoo Finance chart data.
- Event day: first US trading day on or after the announcement date. Returns compare the previous trading day's adjusted close with event day, +1, +3, and +5 trading-day closes.
- Caveat: if an announcement was after market close, its immediate reaction may appear in the +1 trading-day column.

## High-level findings

- Events analyzed: ${all.count}
- Median GOOGL +1 trading-day return: ${pct(all.medD1)}
- Average GOOGL +1 trading-day return: ${pct(all.avgD1)}
- Average GOOGL +1 trading-day excess return vs QQQ: ${pct(all.avgExcessD1)}
- Google release events: ${google.count}; average +1 day ${pct(google.avgD1)}, average excess ${pct(google.avgExcessD1)}
- Competitor release events: ${competitors.count}; average +1 day ${pct(competitors.avgD1)}, average excess ${pct(competitors.avgExcessD1)}
- OpenAI release events: ${openai.count}; average +1 day ${pct(openai.avgD1)}, average excess ${pct(openai.avgExcessD1)}

## Largest reactions

- Best GOOGL +1 day: ${best.firm} ${best.model} (${best.date}) at ${pct(best.googl_d1)}.
- Worst GOOGL +1 day: ${worst.firm} ${worst.model} (${worst.date}) at ${pct(worst.googl_d1)}.
- Best +1 day excess vs QQQ: ${bestExcess.firm} ${bestExcess.model} (${bestExcess.date}) at ${pct(bestExcess.excess_d1)}.
- Worst +1 day excess vs QQQ: ${worstExcess.firm} ${worstExcess.model} (${worstExcess.date}) at ${pct(worstExcess.excess_d1)}.

## Interpretation

Alphabet's share-price reaction to AI model launches was not one-directional. The clearest selloffs clustered around perceived threats to search economics or AI capital-efficiency narratives, while many competitor model releases were absorbed by the wider tech-market tape. Google's own Gemini releases generally received a more constructive reaction when they showed product integration, search distribution, or developer readiness rather than just model benchmarks.

The DeepSeek-R1 case needs special handling: the official release date was Jan. 20, 2025, when US markets were closed; the stronger equity-market reaction came around Jan. 27 as the cost-efficiency narrative spread across global AI stocks. The dataset includes both rows so the website can show the difference between release date and market digestion.

## Data rows

| Date | Firm | Model | Type | GOOGL +1d | Excess vs QQQ +1d |
| --- | --- | --- | --- | ---: | ---: |
${enriched
  .map(
    (row) =>
      `| ${row.date} | ${row.firm} | ${row.model} | ${row.type} | ${pct(row.googl_d1)} | ${pct(row.excess_d1)} |`,
  )
  .join("\n")}
`;

await fs.writeFile(path.join(root, "ai_model_google_reaction.csv"), `${csv}\n`);
await fs.writeFile(path.join(root, "ai_model_google_reaction.md"), markdown);

console.log(`Wrote ${enriched.length} AI model event rows`);
console.log(`All median +1d: ${pct(all.medD1)}; avg +1d: ${pct(all.avgD1)}; avg excess: ${pct(all.avgExcessD1)}`);
console.log(`Google avg +1d: ${pct(google.avgD1)}; competitor avg +1d: ${pct(competitors.avgD1)}`);
console.log(`Worst +1d: ${worst.firm} ${worst.model} ${pct(worst.googl_d1)}`);
