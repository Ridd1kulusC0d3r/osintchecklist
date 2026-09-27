const STORAGE_KEY = "osintChecklistCaseV1";
let model = null;
let state = {
  meta: {
    caseRef: "",
    profile: "all",
    objective: "",
    scope: "",
    urgency: "normal",
    analyst: "",
    context: ""
  },
  tasks: {}
};

const $ = (id) => document.getElementById(id);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = {
        meta: { ...state.meta, ...(parsed.meta || {}) },
        tasks: parsed.tasks || {}
      };
    }
  } catch (error) {
    console.warn("Could not load local case state", error);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateProgress();
}

function taskState(id) {
  if (!state.tasks[id]) {
    state.tasks[id] = { status: "todo", note: "", source: "" };
  }
  return state.tasks[id];
}

function isApplicable(item) {
  const profile = state.meta.profile || "all";
  if (profile === "all") return true;
  return item.tags.includes("all") || item.tags.includes(profile);
}

function taskMatchesUiFilters(item) {
  if (!isApplicable(item)) return false;

  const q = $("search").value.trim().toLowerCase();
  const statusFilter = $("statusFilter").value;
  const ts = taskState(item.id);

  const haystack = [item.title, item.description, ...(item.tags || [])].join(" ").toLowerCase();
  if (q && !haystack.includes(q)) return false;
  if (statusFilter !== "all" && ts.status !== statusFilter) return false;
  return true;
}

function renderChecklist() {
  const root = $("checklist");
  root.innerHTML = "";
  let visibleCount = 0;

  for (const phase of model.phases) {
    const applicable = phase.items.filter(isApplicable);
    const visible = applicable.filter(taskMatchesUiFilters);
    if (!visible.length) continue;

    visibleCount += visible.length;

    const section = document.createElement("section");
    section.className = "phase";
    section.dataset.phase = phase.id;

    const doneCount = applicable.filter(item => taskState(item.id).status === "done").length;
    const denominator = applicable.filter(item => taskState(item.id).status !== "na").length;

    const header = document.createElement("div");
    header.className = "phase-header";
    header.innerHTML = `
      <div>
        <h3>${escapeHtml(phase.title)}</h3>
        <div class="small muted">${escapeHtml(phase.description)}</div>
      </div>
      <div class="phase-meta">${doneCount} / ${denominator} concluídos</div>
    `;
    section.appendChild(header);

    const list = document.createElement("div");
    list.className = "task-list";

    for (const item of visible) {
      const ts = taskState(item.id);
      const row = document.createElement("article");
      row.className = "task" + (ts.status === "done" ? " task-done" : "");
      row.dataset.taskId = item.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-check";
      checkbox.checked = ts.status === "done";
      checkbox.setAttribute("aria-label", `Marcar ${item.title} como concluído`);
      checkbox.addEventListener("change", () => {
        ts.status = checkbox.checked ? "done" : "todo";
        saveState();
        renderChecklist();
      });

      const body = document.createElement("div");
      body.innerHTML = `
        <div class="task-title">${escapeHtml(item.title)}</div>
        <div class="task-desc">${escapeHtml(item.description)}</div>
        <div class="badges">
          <span class="badge ${item.core ? "core" : ""}">${item.core ? "NÚCLEO" : "CONTEXTUAL"}</span>
          ${item.tags.filter(t => t !== "all").map(t => `<span class="badge">${escapeHtml(t.toUpperCase())}</span>`).join("")}
        </div>
      `;

      const status = document.createElement("select");
      status.className = "task-status";
      status.innerHTML = `
        <option value="todo">Não iniciado</option>
        <option value="doing">Em andamento</option>
        <option value="done">Concluído</option>
        <option value="na">Não aplicável</option>
      `;
      status.value = ts.status;
      status.addEventListener("change", () => {
        ts.status = status.value;
        saveState();
        renderChecklist();
      });

      const details = document.createElement("div");
      details.className = "task-details";

      const noteLabel = document.createElement("label");
      noteLabel.textContent = "Observação / achado";
      const note = document.createElement("textarea");
      note.rows = 2;
      note.placeholder = "Registre fato observado, resultado negativo, limitação ou conclusão intermediária.";
      note.value = ts.note || "";
      note.addEventListener("input", () => {
        ts.note = note.value;
        saveState();
      });
      noteLabel.appendChild(note);

      const sourceLabel = document.createElement("label");
      sourceLabel.textContent = "Fonte / evidência";
      const source = document.createElement("input");
      source.type = "text";
      source.placeholder = "URL, evidence ID, documento ou referência interna";
      source.value = ts.source || "";
      source.addEventListener("input", () => {
        ts.source = source.value;
        saveState();
      });
      sourceLabel.appendChild(source);

      details.append(noteLabel, sourceLabel);
      row.append(checkbox, body, status, details);
      list.appendChild(row);
    }

    section.appendChild(list);
    root.appendChild(section);
  }

  if (!visibleCount) {
    root.innerHTML = `<div class="empty">Nenhuma tarefa corresponde aos filtros atuais.</div>`;
  }
}

function applicableItems() {
  return model.phases.flatMap(phase =>
    phase.items.filter(isApplicable).map(item => ({ ...item, phaseId: phase.id, phaseTitle: phase.title }))
  );
}

function updateProgress() {
  if (!model) return;

  const items = applicableItems();
  const counted = items.filter(item => taskState(item.id).status !== "na");
  const done = counted.filter(item => taskState(item.id).status === "done");
  const pct = counted.length ? Math.round((done.length / counted.length) * 100) : 0;

  $("overallBar").style.width = `${pct}%`;
  $("overallPct").textContent = `${pct}%`;
  $("overallCount").textContent = `${done.length} / ${counted.length} aplicáveis`;

  const phaseRoot = $("phaseProgress");
  phaseRoot.innerHTML = "";
  for (const phase of model.phases) {
    const phaseItems = phase.items.filter(isApplicable);
    if (!phaseItems.length) continue;
    const phaseCounted = phaseItems.filter(item => taskState(item.id).status !== "na");
    const phaseDone = phaseCounted.filter(item => taskState(item.id).status === "done");
    const row = document.createElement("div");
    row.className = "phase-row";
    row.innerHTML = `<span>${escapeHtml(phase.title.replace(/^\d+ · /, ""))}</span><span>${phaseDone.length}/${phaseCounted.length}</span>`;
    phaseRoot.appendChild(row);
  }
}

function syncMetaToInputs() {
  for (const key of ["caseRef","profile","objective","scope","urgency","analyst","context"]) {
    $(key).value = state.meta[key] || "";
  }
}

function bindMeta() {
  for (const key of ["caseRef","profile","objective","scope","urgency","analyst","context"]) {
    $(key).addEventListener("input", () => {
      state.meta[key] = $(key).value;
      saveState();
      if (key === "profile") renderChecklist();
    });
    $(key).addEventListener("change", () => {
      state.meta[key] = $(key).value;
      saveState();
      if (key === "profile") renderChecklist();
    });
  }
}

function safeFilePart(value) {
  return (value || "case")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "case";
}

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function progressSnapshot() {
  const items = applicableItems();
  const counted = items.filter(i => taskState(i.id).status !== "na");
  const done = counted.filter(i => taskState(i.id).status === "done");
  return {
    done: done.length,
    total: counted.length,
    pct: counted.length ? Math.round((done.length / counted.length) * 100) : 0
  };
}

function buildMarkdownReport() {
  const p = progressSnapshot();
  const items = applicableItems();
  const documented = items.filter(i => {
    const ts = taskState(i.id);
    return ts.note.trim() || ts.source.trim();
  });
  const pendingCore = items.filter(i => i.core && !["done","na"].includes(taskState(i.id).status));

  const lines = [
    "# OSINT Investigation Report",
    "",
    `**Case reference:** ${state.meta.caseRef || "Not provided"}`,
    `**Analyst/team:** ${state.meta.analyst || "Not provided"}`,
    `**Profile:** ${state.meta.profile || "all"}`,
    `**Urgency:** ${state.meta.urgency || "normal"}`,
    `**Checklist progress:** ${p.done}/${p.total} (${p.pct}%)`,
    `**Generated:** ${new Date().toISOString()}`,
    "",
    "## Executive summary",
    "",
    state.meta.objective
      ? `The investigation was structured to address: ${state.meta.objective}`
      : "No intelligence requirement was recorded.",
    "",
    documented.length
      ? `${documented.length} checklist items contain analyst notes and/or source references. ${pendingCore.length} core steps remain open.`
      : `No findings have been documented yet. ${pendingCore.length} core steps remain open.`,
    "",
    "## Scope",
    "",
    state.meta.scope || "Not provided.",
    "",
    "## Context",
    "",
    state.meta.context || "Not provided.",
    "",
    "## Documented findings"
  ];

  if (!documented.length) {
    lines.push("", "_No findings documented._");
  } else {
    for (const item of documented) {
      const ts = taskState(item.id);
      lines.push(
        "",
        `### ${item.title}`,
        `- **Phase:** ${item.phaseTitle}`,
        `- **Status:** ${ts.status}`,
        `- **Observation:** ${ts.note || "Not provided"}`,
        `- **Source/evidence:** ${ts.source || "Not provided"}`
      );
    }
  }

  lines.push("", "## Open core steps");
  if (!pendingCore.length) {
    lines.push("", "No open core steps.");
  } else {
    for (const item of pendingCore) {
      lines.push(`- [ ] ${item.title} — ${item.phaseTitle}`);
    }
  }

  lines.push(
    "",
    "## Methodological caveat",
    "",
    "A completed checklist item records that a procedure was performed. It does not by itself confirm an attribution, identity, hypothesis or allegation. Material judgments should remain traceable to evidence, corroboration and stated uncertainty.",
    ""
  );

  return lines.join("\n");
}

function exportJson() {
  const payload = {
    schema: "osintchecklist.case.v1",
    exportedAt: new Date().toISOString(),
    checklistVersion: model.version,
    ...state
  };
  download(
    `${safeFilePart(state.meta.caseRef)}-osint-case.json`,
    JSON.stringify(payload, null, 2),
    "application/json;charset=utf-8"
  );
}

function exportMarkdown() {
  download(
    `${safeFilePart(state.meta.caseRef)}-osint-report.md`,
    buildMarkdownReport(),
    "text/markdown;charset=utf-8"
  );
}

function printReport() {
  const p = progressSnapshot();
  const items = applicableItems();
  const documented = items.filter(i => {
    const ts = taskState(i.id);
    return ts.note.trim() || ts.source.trim();
  });
  const pendingCore = items.filter(i => i.core && !["done","na"].includes(taskState(i.id).status));

  const findings = documented.length
    ? documented.map(item => {
        const ts = taskState(item.id);
        return `
          <section>
            <h3>${escapeHtml(item.title)}</h3>
            <p><strong>Phase:</strong> ${escapeHtml(item.phaseTitle)}</p>
            <p><strong>Status:</strong> ${escapeHtml(ts.status)}</p>
            <p><strong>Observation:</strong> ${escapeHtml(ts.note || "Not provided")}</p>
            <p><strong>Source/evidence:</strong> ${escapeHtml(ts.source || "Not provided")}</p>
          </section>
        `;
      }).join("")
    : "<p>No findings documented.</p>";

  const pending = pendingCore.length
    ? `<ul>${pendingCore.map(i => `<li>${escapeHtml(i.title)} — ${escapeHtml(i.phaseTitle)}</li>`).join("")}</ul>`
    : "<p>No open core steps.</p>";

  const html = `<!doctype html>
  <html><head><meta charset="utf-8"><title>OSINT Report</title>
  <style>
    body{font-family:Arial,sans-serif;color:#111;max-width:920px;margin:40px auto;padding:0 24px;line-height:1.5}
    h1{font-size:32px;margin-bottom:6px} h2{margin-top:34px;border-bottom:1px solid #bbb;padding-bottom:7px}
    h3{margin-bottom:6px} section{break-inside:avoid;margin-bottom:22px}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px;background:#f3f3f3;padding:16px}
    .muted{color:#666;font-size:12px}
    @media print{body{margin:0;max-width:none}.no-print{display:none}}
  </style></head>
  <body>
    <button class="no-print" onclick="window.print()">Print / Save as PDF</button>
    <h1>OSINT Investigation Report</h1>
    <p class="muted">Generated ${escapeHtml(new Date().toISOString())}</p>
    <div class="meta">
      <div><strong>Case:</strong> ${escapeHtml(state.meta.caseRef || "Not provided")}</div>
      <div><strong>Analyst:</strong> ${escapeHtml(state.meta.analyst || "Not provided")}</div>
      <div><strong>Profile:</strong> ${escapeHtml(state.meta.profile)}</div>
      <div><strong>Progress:</strong> ${p.done}/${p.total} (${p.pct}%)</div>
    </div>
    <h2>Executive summary</h2>
    <p>${escapeHtml(state.meta.objective || "No intelligence requirement was recorded.")}</p>
    <p>${documented.length} checklist items contain notes and/or evidence references. ${pendingCore.length} core steps remain open.</p>
    <h2>Scope</h2><p>${escapeHtml(state.meta.scope || "Not provided.")}</p>
    <h2>Context</h2><p>${escapeHtml(state.meta.context || "Not provided.")}</p>
    <h2>Documented findings</h2>
    ${findings}
    <h2>Open core steps</h2>
    ${pending}
    <h2>Methodological caveat</h2>
    <p>A checked item records procedure completion, not proof of attribution or identity. Material judgments should remain linked to evidence, corroboration and uncertainty.</p>
  </body></html>`;

  const w = window.open("", "_blank");
  if (!w) {
    alert("O navegador bloqueou a janela do relatório. Permita pop-ups para usar impressão/PDF.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function renderInsights() {
  const items = applicableItems();
  const openCore = items.filter(i => i.core && !["done","na"].includes(taskState(i.id).status));
  const undocumentedDone = items.filter(i => {
    const ts = taskState(i.id);
    return ts.status === "done" && !ts.note.trim() && !ts.source.trim();
  });
  const notesWithoutSource = items.filter(i => {
    const ts = taskState(i.id);
    return ts.note.trim() && !ts.source.trim();
  });

  const weakPhases = model.phases.map(phase => {
    const arr = phase.items.filter(isApplicable).filter(i => taskState(i.id).status !== "na");
    const done = arr.filter(i => taskState(i.id).status === "done").length;
    return { title: phase.title, total: arr.length, done, pct: arr.length ? Math.round(done / arr.length * 100) : 100 };
  }).filter(x => x.total && x.pct < 50);

  const block = (title, text, entries) => {
    const list = entries.length
      ? `<ul>${entries.slice(0,12).map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`
      : "<p>Nenhum item detectado.</p>";
    return `<div class="insight-block"><h3>${escapeHtml(title)}</h3><p class="small muted">${escapeHtml(text)}</p>${list}</div>`;
  };

  $("insightsContent").innerHTML =
    block(
      "Etapas núcleo ainda abertas",
      "Lacunas procedimentais que merecem revisão antes do encerramento.",
      openCore.map(i => `${i.title} — ${i.phaseTitle}`)
    ) +
    block(
      "Concluído sem documentação",
      "A tarefa foi marcada como concluída, mas não há observação nem referência de evidência.",
      undocumentedDone.map(i => i.title)
    ) +
    block(
      "Observações sem fonte/referência",
      "Pode ser válido em notas preliminares, mas achados materiais devem ser rastreáveis.",
      notesWithoutSource.map(i => i.title)
    ) +
    block(
      "Fases com menos de 50% de conclusão",
      "Indicador de cobertura, não de qualidade ou certeza.",
      weakPhases.map(p => `${p.title}: ${p.done}/${p.total} (${p.pct}%)`)
    );

  $("insightsDialog").showModal();
}

function resetCase() {
  const confirmed = confirm("Limpar todos os dados locais deste caso neste navegador?");
  if (!confirmed) return;
  localStorage.removeItem(STORAGE_KEY);
  state = {
    meta: {
      caseRef: "",
      profile: "all",
      objective: "",
      scope: "",
      urgency: "normal",
      analyst: "",
      context: ""
    },
    tasks: {}
  };
  syncMetaToInputs();
  renderChecklist();
  updateProgress();
}

async function init() {
  try {
    const response = await fetch("data/checklist.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Checklist HTTP ${response.status}`);
    model = await response.json();
  } catch (error) {
    console.error(error);
    $("checklist").innerHTML = `
      <div class="empty">
        Não foi possível carregar <code>data/checklist.json</code>.<br>
        Use GitHub Pages ou um servidor estático local em vez de abrir via <code>file://</code>.
      </div>`;
    return;
  }

  loadState();
  syncMetaToInputs();
  bindMeta();

  $("search").addEventListener("input", renderChecklist);
  $("statusFilter").addEventListener("change", renderChecklist);
  $("exportJsonBtn").addEventListener("click", exportJson);
  $("exportMdBtn").addEventListener("click", exportMarkdown);
  $("printBtn").addEventListener("click", printReport);
  $("insightsBtn").addEventListener("click", renderInsights);
  $("closeInsightsBtn").addEventListener("click", () => $("insightsDialog").close());
  $("resetBtn").addEventListener("click", resetCase);

  renderChecklist();
  updateProgress();
}

document.addEventListener("DOMContentLoaded", init);
