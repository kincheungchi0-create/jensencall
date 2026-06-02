const state = {
  rows: [],
  filter: "all",
  search: "",
};

const investmentPattern =
  /personal beneficial ownership|corporate holding|corporate investment|announced investment|former nvidia corporate holding/i;
const mentionPattern = /mention|keynote|press release|event material|cloud ecosystem/i;

const stockRows = document.querySelector("#stockRows");
const searchInput = document.querySelector("#searchInput");
const tabs = Array.from(document.querySelectorAll(".tab"));
const columnLabels = {
  latest_verified_time: "Time",
  stock: "Stock",
  company: "Company",
  relationship_type: "Type",
  evidence_summary: "Evidence",
  confidence: "Confidence",
  source_url: "Source",
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      i += 1;
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
      if (char === "\r" && next === "\n") i += 1;
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
  return rows.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
  );
}

function matchesFilter(row) {
  const searchable = `${row.relationship_type} ${row.evidence_summary} ${row.notes}`;
  if (state.filter === "investment") return investmentPattern.test(searchable);
  if (state.filter === "mention") return mentionPattern.test(searchable);
  return true;
}

function matchesSearch(row) {
  if (!state.search) return true;
  const haystack = Object.values(row).join(" ").toLowerCase();
  return haystack.includes(state.search);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderMetrics() {
  const investmentRows = state.rows.filter((row) =>
    investmentPattern.test(`${row.relationship_type} ${row.evidence_summary} ${row.notes}`),
  );
  const mentionRows = state.rows.filter((row) =>
    mentionPattern.test(`${row.relationship_type} ${row.evidence_summary} ${row.notes}`),
  );
  document.querySelector("#totalRows").textContent = state.rows.length;
  document.querySelector("#investmentRows").textContent = investmentRows.length;
  document.querySelector("#mentionRows").textContent = mentionRows.length;
}

function renderTable() {
  const rows = state.rows.filter(matchesFilter).filter(matchesSearch);

  if (!rows.length) {
    stockRows.innerHTML = '<tr class="empty-row"><td colspan="7">No rows</td></tr>';
    return;
  }

  stockRows.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td class="time" data-label="${columnLabels.latest_verified_time}">${escapeHtml(row.latest_verified_time)}</td>
          <td class="stock" data-label="${columnLabels.stock}">${escapeHtml(row.stock)}</td>
          <td class="company" data-label="${columnLabels.company}">${escapeHtml(row.company)}</td>
          <td class="relationship" data-label="${columnLabels.relationship_type}">${escapeHtml(row.relationship_type)}</td>
          <td class="evidence" data-label="${columnLabels.evidence_summary}">${escapeHtml(row.evidence_summary)}</td>
          <td class="confidence" data-label="${columnLabels.confidence}">${escapeHtml(row.confidence)}</td>
          <td class="source" data-label="${columnLabels.source_url}"><a href="${escapeHtml(row.source_url)}" target="_blank" rel="noreferrer">Open</a></td>
        </tr>
      `,
    )
    .join("");
}

function render() {
  renderMetrics();
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
    renderTable();
  });
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value.trim().toLowerCase();
  renderTable();
});

fetch("jensen_huang_stocks_extraction.csv")
  .then((response) => {
    if (!response.ok) throw new Error(`CSV request failed: ${response.status}`);
    return response.text();
  })
  .then((text) => {
    state.rows = csvToObjects(text);
    render();
  })
  .catch((error) => {
    stockRows.innerHTML = `<tr><td colspan="7">${escapeHtml(error.message)}</td></tr>`;
  });
