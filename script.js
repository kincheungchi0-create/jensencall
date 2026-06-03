const state = {
  rows: [],
  filter: "all",
  firm: "all",
  search: "",
};

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
  renderChart();
  renderTable();
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
