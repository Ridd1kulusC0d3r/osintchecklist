const STORAGE_KEY = "osintChecklistCaseV1";
const LANG_KEY = "osintChecklistLanguageV1";

let baseModel = null;
let model = null;
const translationCache = {};

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

const UI = {
  "pt-BR": {
    languageLabel: "Idioma",
    subtitle: "Checklist metodológico, rastreável e local-first para investigações em fontes abertas.",
    privacyTitle: "O conteúdo do caso fica no armazenamento local deste navegador.",
    caseHeading: "Caso",
    reset: "Limpar",
    caseRefLabel: "Referência do caso",
    profileLabel: "Perfil de investigação",
    objectiveLabel: "Objetivo / requisito de inteligência",
    objectivePlaceholder: "Qual pergunta precisa ser respondida e qual decisão será apoiada?",
    scopeLabel: "Escopo",
    scopePlaceholder: "Período, região, fontes permitidas, limites e critérios de encerramento.",
    urgencyLabel: "Urgência",
    analystLabel: "Analista",
    analystPlaceholder: "Alias ou equipe",
    contextLabel: "Contexto resumido",
    contextPlaceholder: "Registre somente o necessário. Prefira aliases e referências internas.",
    privacyNotice: "<strong>Minimização por padrão.</strong> Evite PII desnecessária, credenciais, segredos ou dados que você não esteja autorizado a tratar.",
    progressHeading: "Progresso",
    applicable: "aplicáveis",
    exportHeading: "Exportar",
    exportJson: "Exportar estado JSON",
    exportMd: "Exportar relatório Markdown",
    printPdf: "Imprimir / salvar PDF",
    insights: "Insights de processo",
    exportHint: "O resumo é derivado somente do que foi preenchido neste navegador.",
    checklistHeading: "Checklist",
    searchPlaceholder: "Filtrar tarefas...",
    searchSr: "Filtrar checklist",
    legendCore: "Etapa núcleo",
    legendContext: "Etapa contextual",
    legendCaveat: "✓ registrar execução ≠ confirmar hipótese",
    insightsHeading: "Insights de processo",
    close: "Fechar",
    footerCaveat: "Checklist não substitui julgamento analítico, revisão legal ou validação de evidências.",
    profiles: {
      all: "OSINT geral",
      person: "Pessoa / entidade",
      organization: "Organização",
      cyber: "Cyber / infraestrutura",
      fraud: "Fraude / golpe",
      media: "Verificação de mídia"
    },
    urgencies: { normal: "Normal", high: "Alta", critical: "Crítica" },
    statuses: { all: "Todos os status", todo: "Não iniciado", doing: "Em andamento", done: "Concluído", na: "Não aplicável" },
    core: "NÚCLEO",
    contextual: "CONTEXTUAL",
    completed: "concluídos",
    noteLabel: "Observação / achado",
    notePlaceholder: "Registre fato observado, resultado negativo, limitação ou conclusão intermediária.",
    sourceLabel: "Fonte / evidência",
    sourcePlaceholder: "URL, evidence ID, documento ou referência interna",
    markDone: "Marcar como concluído:",
    emptyFilter: "Nenhuma tarefa corresponde aos filtros atuais.",
    loadError: "Não foi possível carregar o checklist. Use GitHub Pages ou um servidor estático local.",
    resetConfirm: "Limpar todos os dados locais deste caso neste navegador?",
    popupBlocked: "O navegador bloqueou a janela do relatório. Permita pop-ups para usar impressão/PDF.",
    tags: { person:"PESSOA", organization:"ORGANIZAÇÃO", cyber:"CYBER", fraud:"FRAUDE", media:"MÍDIA" },
    report: {
      title: "Relatório de Investigação OSINT",
      caseRef: "Referência do caso",
      analyst: "Analista/equipe",
      profile: "Perfil",
      urgency: "Urgência",
      progress: "Progresso do checklist",
      generated: "Gerado em",
      executive: "Resumo executivo",
      objectivePrefix: "A investigação foi estruturada para responder:",
      noObjective: "Nenhum requisito de inteligência foi registrado.",
      documented: (n,p) => `${n} itens do checklist contêm observações e/ou referências de fonte. ${p} etapas núcleo permanecem abertas.`,
      noFindingsSummary: p => `Nenhum achado foi documentado ainda. ${p} etapas núcleo permanecem abertas.`,
      scope: "Escopo",
      context: "Contexto",
      findings: "Achados documentados",
      noFindings: "Nenhum achado documentado.",
      phase: "Fase",
      status: "Status",
      observation: "Observação",
      source: "Fonte/evidência",
      notProvided: "Não informado",
      openCore: "Etapas núcleo abertas",
      noOpenCore: "Nenhuma etapa núcleo aberta.",
      caveatHeading: "Ressalva metodológica",
      caveat: "Um item concluído registra que um procedimento foi executado. Isso, por si só, não confirma atribuição, identidade, hipótese ou alegação. Julgamentos materiais devem permanecer rastreáveis a evidências, corroboracão e incerteza declarada.",
      print: "Imprimir / Salvar como PDF"
    },
    process: {
      openCore: "Etapas núcleo ainda abertas",
      openCoreDesc: "Lacunas procedimentais que merecem revisão antes do encerramento.",
      undocumented: "Concluído sem documentação",
      undocumentedDesc: "A tarefa foi marcada como concluída, mas não há observação nem referência de evidência.",
      noSource: "Observações sem fonte/referência",
      noSourceDesc: "Pode ser válido em notas preliminares, mas achados materiais devem ser rastreáveis.",
      weak: "Fases com menos de 50% de conclusão",
      weakDesc: "Indicador de cobertura, não de qualidade ou certeza.",
      none: "Nenhum item detectado."
    }
  },
  en: {
    languageLabel: "Language",
    subtitle: "A traceable, local-first methodological checklist for open-source investigations.",
    privacyTitle: "Case content stays in this browser's local storage.",
    caseHeading: "Case",
    reset: "Reset",
    caseRefLabel: "Case reference",
    profileLabel: "Investigation profile",
    objectiveLabel: "Objective / intelligence requirement",
    objectivePlaceholder: "What question must be answered and what decision will it support?",
    scopeLabel: "Scope",
    scopePlaceholder: "Time period, region, permitted sources, limits and stop conditions.",
    urgencyLabel: "Urgency",
    analystLabel: "Analyst",
    analystPlaceholder: "Alias or team",
    contextLabel: "Context summary",
    contextPlaceholder: "Record only what is necessary. Prefer aliases and internal references.",
    privacyNotice: "<strong>Minimization by default.</strong> Avoid unnecessary personal data, credentials, secrets or information you are not authorized to process.",
    progressHeading: "Progress",
    applicable: "applicable",
    exportHeading: "Export",
    exportJson: "Export JSON state",
    exportMd: "Export Markdown report",
    printPdf: "Print / save PDF",
    insights: "Process insights",
    exportHint: "The summary is derived only from information entered in this browser.",
    checklistHeading: "Checklist",
    searchPlaceholder: "Filter tasks...",
    searchSr: "Filter checklist",
    legendCore: "Core step",
    legendContext: "Contextual step",
    legendCaveat: "✓ execution recorded ≠ hypothesis confirmed",
    insightsHeading: "Process insights",
    close: "Close",
    footerCaveat: "A checklist does not replace analytic judgment, legal review or evidence validation.",
    profiles: {
      all: "General OSINT",
      person: "Person / entity",
      organization: "Organization",
      cyber: "Cyber / infrastructure",
      fraud: "Fraud / scam",
      media: "Media verification"
    },
    urgencies: { normal: "Normal", high: "High", critical: "Critical" },
    statuses: { all: "All statuses", todo: "Not started", doing: "In progress", done: "Completed", na: "Not applicable" },
    core: "CORE",
    contextual: "CONTEXTUAL",
    completed: "completed",
    noteLabel: "Observation / finding",
    notePlaceholder: "Record an observed fact, negative result, limitation or intermediate conclusion.",
    sourceLabel: "Source / evidence",
    sourcePlaceholder: "URL, evidence ID, document or internal reference",
    markDone: "Mark as completed:",
    emptyFilter: "No tasks match the current filters.",
    loadError: "The checklist could not be loaded. Use GitHub Pages or a local static server.",
    resetConfirm: "Clear all local data for this case in this browser?",
    popupBlocked: "The browser blocked the report window. Allow pop-ups to use print/PDF.",
    tags: { person:"PERSON", organization:"ORGANIZATION", cyber:"CYBER", fraud:"FRAUD", media:"MEDIA" },
    report: {
      title: "OSINT Investigation Report",
      caseRef: "Case reference",
      analyst: "Analyst/team",
      profile: "Profile",
      urgency: "Urgency",
      progress: "Checklist progress",
      generated: "Generated",
      executive: "Executive summary",
      objectivePrefix: "The investigation was structured to address:",
      noObjective: "No intelligence requirement was recorded.",
      documented: (n,p) => `${n} checklist items contain analyst notes and/or source references. ${p} core steps remain open.`,
      noFindingsSummary: p => `No findings have been documented yet. ${p} core steps remain open.`,
      scope: "Scope",
      context: "Context",
      findings: "Documented findings",
      noFindings: "No findings documented.",
      phase: "Phase",
      status: "Status",
      observation: "Observation",
      source: "Source/evidence",
      notProvided: "Not provided",
      openCore: "Open core steps",
      noOpenCore: "No open core steps.",
      caveatHeading: "Methodological caveat",
      caveat: "A completed checklist item records that a procedure was performed. It does not by itself confirm an attribution, identity, hypothesis or allegation. Material judgments should remain traceable to evidence, corroboration and stated uncertainty.",
      print: "Print / Save as PDF"
    },
    process: {
      openCore: "Core steps still open",
      openCoreDesc: "Procedural gaps that deserve review before closure.",
      undocumented: "Completed without documentation",
      undocumentedDesc: "The task is marked completed, but has no observation or evidence reference.",
      noSource: "Observations without a source/reference",
      noSourceDesc: "This may be acceptable in preliminary notes, but material findings should be traceable.",
      weak: "Phases below 50% completion",
      weakDesc: "A coverage indicator, not a measure of quality or certainty.",
      none: "No items detected."
    }
  },
  es: {
    languageLabel: "Idioma",
    subtitle: "Checklist metodológico, trazable y local-first para investigaciones de fuentes abiertas.",
    privacyTitle: "El contenido del caso permanece en el almacenamiento local de este navegador.",
    caseHeading: "Caso",
    reset: "Limpiar",
    caseRefLabel: "Referencia del caso",
    profileLabel: "Perfil de investigación",
    objectiveLabel: "Objetivo / requisito de inteligencia",
    objectivePlaceholder: "¿Qué pregunta debe responderse y qué decisión apoyará?",
    scopeLabel: "Alcance",
    scopePlaceholder: "Período, región, fuentes permitidas, límites y criterios de cierre.",
    urgencyLabel: "Urgencia",
    analystLabel: "Analista",
    analystPlaceholder: "Alias o equipo",
    contextLabel: "Resumen del contexto",
    contextPlaceholder: "Registre solo lo necesario. Prefiera alias y referencias internas.",
    privacyNotice: "<strong>Minimización por defecto.</strong> Evite datos personales innecesarios, credenciales, secretos o información que no esté autorizado a tratar.",
    progressHeading: "Progreso",
    applicable: "aplicables",
    exportHeading: "Exportar",
    exportJson: "Exportar estado JSON",
    exportMd: "Exportar informe Markdown",
    printPdf: "Imprimir / guardar PDF",
    insights: "Insights del proceso",
    exportHint: "El resumen se deriva únicamente de la información ingresada en este navegador.",
    checklistHeading: "Checklist",
    searchPlaceholder: "Filtrar tareas...",
    searchSr: "Filtrar checklist",
    legendCore: "Etapa núcleo",
    legendContext: "Etapa contextual",
    legendCaveat: "✓ registrar ejecución ≠ confirmar hipótesis",
    insightsHeading: "Insights del proceso",
    close: "Cerrar",
    footerCaveat: "El checklist no sustituye el juicio analítico, la revisión legal ni la validación de evidencias.",
    profiles: {
      all: "OSINT general",
      person: "Persona / entidad",
      organization: "Organización",
      cyber: "Cyber / infraestructura",
      fraud: "Fraude / estafa",
      media: "Verificación de medios"
    },
    urgencies: { normal: "Normal", high: "Alta", critical: "Crítica" },
    statuses: { all: "Todos los estados", todo: "No iniciado", doing: "En curso", done: "Completado", na: "No aplicable" },
    core: "NÚCLEO",
    contextual: "CONTEXTUAL",
    completed: "completados",
    noteLabel: "Observación / hallazgo",
    notePlaceholder: "Registre un hecho observado, resultado negativo, limitación o conclusión intermedia.",
    sourceLabel: "Fuente / evidencia",
    sourcePlaceholder: "URL, evidence ID, documento o referencia interna",
    markDone: "Marcar como completado:",
    emptyFilter: "Ninguna tarea coincide con los filtros actuales.",
    loadError: "No fue posible cargar el checklist. Use GitHub Pages o un servidor estático local.",
    resetConfirm: "¿Limpiar todos los datos locales de este caso en este navegador?",
    popupBlocked: "El navegador bloqueó la ventana del informe. Permita pop-ups para usar impresión/PDF.",
    tags: { person:"PERSONA", organization:"ORGANIZACIÓN", cyber:"CYBER", fraud:"FRAUDE", media:"MEDIOS" },
    report: {
      title: "Informe de Investigación OSINT",
      caseRef: "Referencia del caso",
      analyst: "Analista/equipo",
      profile: "Perfil",
      urgency: "Urgencia",
      progress: "Progreso del checklist",
      generated: "Generado",
      executive: "Resumen ejecutivo",
      objectivePrefix: "La investigación fue estructurada para responder:",
      noObjective: "No se registró ningún requisito de inteligencia.",
      documented: (n,p) => `${n} elementos del checklist contienen observaciones y/o referencias de fuente. ${p} etapas núcleo permanecen abiertas.`,
      noFindingsSummary: p => `Aún no se han documentado hallazgos. ${p} etapas núcleo permanecen abiertas.`,
      scope: "Alcance",
      context: "Contexto",
      findings: "Hallazgos documentados",
      noFindings: "No hay hallazgos documentados.",
      phase: "Fase",
      status: "Estado",
      observation: "Observación",
      source: "Fuente/evidencia",
      notProvided: "No informado",
      openCore: "Etapas núcleo abiertas",
      noOpenCore: "No hay etapas núcleo abiertas.",
      caveatHeading: "Salvedad metodológica",
      caveat: "Un elemento completado registra que se ejecutó un procedimiento. Por sí solo no confirma atribución, identidad, hipótesis o alegación. Los juicios materiales deben permanecer trazables a evidencias, corroboración e incertidumbre declarada.",
      print: "Imprimir / Guardar como PDF"
    },
    process: {
      openCore: "Etapas núcleo aún abiertas",
      openCoreDesc: "Brechas procedimentales que merecen revisión antes del cierre.",
      undocumented: "Completado sin documentación",
      undocumentedDesc: "La tarea está marcada como completada, pero no tiene observación ni referencia de evidencia.",
      noSource: "Observaciones sin fuente/referencia",
      noSourceDesc: "Puede ser válido en notas preliminares, pero los hallazgos materiales deben ser trazables.",
      weak: "Fases con menos del 50% de conclusión",
      weakDesc: "Indicador de cobertura, no de calidad o certeza.",
      none: "No se detectaron elementos."
    }
  }
};

const $ = id => document.getElementById(id);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function detectLanguage() {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved && UI[saved]) return saved;
  const browser = (navigator.language || "en").toLowerCase();
  if (browser.startsWith("pt")) return "pt-BR";
  if (browser.startsWith("es")) return "es";
  return "en";
}

let currentLang = detectLanguage();
const t = () => UI[currentLang];

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
  if (!state.tasks[id]) state.tasks[id] = { status: "todo", note: "", source: "" };
  return state.tasks[id];
}

function overlayTranslation(base, translation) {
  const localized = structuredClone(base);
  if (!translation?.phases) return localized;

  for (const phase of localized.phases) {
    const txPhase = translation.phases[phase.id];
    if (!txPhase) continue;
    phase.title = txPhase.title || phase.title;
    phase.description = txPhase.description || phase.description;
    for (const item of phase.items) {
      const txItem = txPhase.items?.[item.id];
      if (!txItem) continue;
      item.title = txItem.title || item.title;
      item.description = txItem.description || item.description;
    }
  }
  return localized;
}

async function loadLocalizedModel(lang) {
  if (!baseModel) {
    const response = await fetch("data/checklist.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Checklist HTTP ${response.status}`);
    baseModel = await response.json();
  }
  if (lang === "pt-BR") return structuredClone(baseModel);

  if (!translationCache[lang]) {
    const response = await fetch(`data/translations.${lang}.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Translation HTTP ${response.status}`);
    translationCache[lang] = await response.json();
  }
  return overlayTranslation(baseModel, translationCache[lang]);
}

function fillSelect(select, entries, selected) {
  select.innerHTML = "";
  for (const [value, label] of Object.entries(entries)) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }
  select.value = selected;
}

function applyUiText() {
  const x = t();
  document.documentElement.lang = currentLang;
  document.querySelector('meta[name="description"]').content = x.subtitle;
  $("languageSelect").value = currentLang;
  $("languageLabel").textContent = x.languageLabel;
  $("languageSelect").setAttribute("aria-label", x.languageLabel);
  $("subtitle").textContent = x.subtitle;
  $("privacyPill").title = x.privacyTitle;
  $("caseHeading").textContent = x.caseHeading;
  $("resetBtn").textContent = x.reset;
  $("caseRefLabel").textContent = x.caseRefLabel;
  $("profileLabel").textContent = x.profileLabel;
  $("objectiveLabel").textContent = x.objectiveLabel;
  $("objective").placeholder = x.objectivePlaceholder;
  $("scopeLabel").textContent = x.scopeLabel;
  $("scope").placeholder = x.scopePlaceholder;
  $("urgencyLabel").textContent = x.urgencyLabel;
  $("analystLabel").textContent = x.analystLabel;
  $("analyst").placeholder = x.analystPlaceholder;
  $("contextLabel").textContent = x.contextLabel;
  $("context").placeholder = x.contextPlaceholder;
  $("privacyNotice").innerHTML = x.privacyNotice;
  $("progressHeading").textContent = x.progressHeading;
  $("exportHeading").textContent = x.exportHeading;
  $("exportJsonBtn").textContent = x.exportJson;
  $("exportMdBtn").textContent = x.exportMd;
  $("printBtn").textContent = x.printPdf;
  $("insightsBtn").textContent = x.insights;
  $("exportHint").textContent = x.exportHint;
  $("checklistHeading").textContent = x.checklistHeading;
  $("search").placeholder = x.searchPlaceholder;
  $("searchSr").textContent = x.searchSr;
  $("legendCore").textContent = x.legendCore;
  $("legendContext").textContent = x.legendContext;
  $("legendCaveat").textContent = x.legendCaveat;
  $("insightsHeading").textContent = x.insightsHeading;
  $("closeInsightsBtn").textContent = x.close;
  $("footerCaveat").textContent = x.footerCaveat;

  fillSelect($("profile"), x.profiles, state.meta.profile || "all");
  fillSelect($("urgency"), x.urgencies, state.meta.urgency || "normal");
  fillSelect($("statusFilter"), x.statuses, $("statusFilter").value || "all");
  $("statusFilter").setAttribute("aria-label", x.statuses.all);
}

async function setLanguage(lang) {
  if (!UI[lang]) lang = "en";
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  model = await loadLocalizedModel(lang);
  applyUiText();
  syncMetaToInputs();
  renderChecklist();
  updateProgress();
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
  const x = t();

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
      <div class="phase-meta">${doneCount} / ${denominator} ${escapeHtml(x.completed)}</div>
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
      checkbox.setAttribute("aria-label", `${x.markDone} ${item.title}`);
      checkbox.addEventListener("change", () => {
        ts.status = checkbox.checked ? "done" : "todo";
        saveState();
        renderChecklist();
      });

      const body = document.createElement("div");
      const tagBadges = item.tags
        .filter(tag => tag !== "all")
        .map(tag => `<span class="badge">${escapeHtml(x.tags[tag] || tag.toUpperCase())}</span>`)
        .join("");

      body.innerHTML = `
        <div class="task-title">${escapeHtml(item.title)}</div>
        <div class="task-desc">${escapeHtml(item.description)}</div>
        <div class="badges">
          <span class="badge ${item.core ? "core" : ""}">${item.core ? x.core : x.contextual}</span>
          ${tagBadges}
        </div>
      `;

      const status = document.createElement("select");
      status.className = "task-status";
      for (const key of ["todo","doing","done","na"]) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = x.statuses[key];
        status.appendChild(option);
      }
      status.value = ts.status;
      status.addEventListener("change", () => {
        ts.status = status.value;
        saveState();
        renderChecklist();
      });

      const details = document.createElement("div");
      details.className = "task-details";

      const noteLabel = document.createElement("label");
      noteLabel.textContent = x.noteLabel;
      const note = document.createElement("textarea");
      note.rows = 2;
      note.placeholder = x.notePlaceholder;
      note.value = ts.note || "";
      note.addEventListener("input", () => {
        ts.note = note.value;
        saveState();
      });
      noteLabel.appendChild(note);

      const sourceLabel = document.createElement("label");
      sourceLabel.textContent = x.sourceLabel;
      const source = document.createElement("input");
      source.type = "text";
      source.placeholder = x.sourcePlaceholder;
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

  if (!visibleCount) root.innerHTML = `<div class="empty">${escapeHtml(x.emptyFilter)}</div>`;
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
  $("overallCount").textContent = `${done.length} / ${counted.length} ${t().applicable}`;

  const phaseRoot = $("phaseProgress");
  phaseRoot.innerHTML = "";
  for (const phase of model.phases) {
    const phaseItems = phase.items.filter(isApplicable);
    if (!phaseItems.length) continue;
    const phaseCounted = phaseItems.filter(item => taskState(item.id).status !== "na");
    const phaseDone = phaseCounted.filter(item => taskState(item.id).status === "done");
    const row = document.createElement("div");
    row.className = "phase-row";
    row.innerHTML = `<span>${escapeHtml(phase.title.replace(/^\d+\s*·\s*/, ""))}</span><span>${phaseDone.length}/${phaseCounted.length}</span>`;
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
    const handler = () => {
      state.meta[key] = $(key).value;
      saveState();
      if (key === "profile") renderChecklist();
    };
    $(key).addEventListener("input", handler);
    $(key).addEventListener("change", handler);
  }
}

function safeFilePart(value) {
  return (value || "case").trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "case";
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
  return { done: done.length, total: counted.length, pct: counted.length ? Math.round((done.length / counted.length) * 100) : 0 };
}

function localizedStatus(code) {
  return t().statuses[code] || code;
}

function localizedProfile(code) {
  return t().profiles[code] || code;
}

function localizedUrgency(code) {
  return t().urgencies[code] || code;
}

function buildMarkdownReport() {
  const x = t().report;
  const p = progressSnapshot();
  const items = applicableItems();
  const documented = items.filter(i => {
    const ts = taskState(i.id);
    return ts.note.trim() || ts.source.trim();
  });
  const pendingCore = items.filter(i => i.core && !["done","na"].includes(taskState(i.id).status));

  const lines = [
    `# ${x.title}`, "",
    `**${x.caseRef}:** ${state.meta.caseRef || x.notProvided}`,
    `**${x.analyst}:** ${state.meta.analyst || x.notProvided}`,
    `**${x.profile}:** ${localizedProfile(state.meta.profile || "all")}`,
    `**${x.urgency}:** ${localizedUrgency(state.meta.urgency || "normal")}`,
    `**${x.progress}:** ${p.done}/${p.total} (${p.pct}%)`,
    `**${x.generated}:** ${new Date().toISOString()}`,
    "", `## ${x.executive}`, "",
    state.meta.objective ? `${x.objectivePrefix} ${state.meta.objective}` : x.noObjective,
    "",
    documented.length ? x.documented(documented.length, pendingCore.length) : x.noFindingsSummary(pendingCore.length),
    "", `## ${x.scope}`, "", state.meta.scope || x.notProvided,
    "", `## ${x.context}`, "", state.meta.context || x.notProvided,
    "", `## ${x.findings}`
  ];

  if (!documented.length) {
    lines.push("", `_${x.noFindings}_`);
  } else {
    for (const item of documented) {
      const ts = taskState(item.id);
      lines.push(
        "", `### ${item.title}`,
        `- **${x.phase}:** ${item.phaseTitle}`,
        `- **${x.status}:** ${localizedStatus(ts.status)}`,
        `- **${x.observation}:** ${ts.note || x.notProvided}`,
        `- **${x.source}:** ${ts.source || x.notProvided}`
      );
    }
  }

  lines.push("", `## ${x.openCore}`);
  if (!pendingCore.length) lines.push("", x.noOpenCore);
  else for (const item of pendingCore) lines.push(`- [ ] ${item.title} — ${item.phaseTitle}`);

  lines.push("", `## ${x.caveatHeading}`, "", x.caveat, "");
  return lines.join("\n");
}

function exportJson() {
  const payload = {
    schema: "osintchecklist.case.v1",
    exportedAt: new Date().toISOString(),
    checklistVersion: model.version,
    locale: currentLang,
    ...state
  };
  download(`${safeFilePart(state.meta.caseRef)}-osint-case.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
}

function exportMarkdown() {
  download(`${safeFilePart(state.meta.caseRef)}-osint-report-${currentLang}.md`, buildMarkdownReport(), "text/markdown;charset=utf-8");
}

function printReport() {
  const x = t().report;
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
        return `<section>
          <h3>${escapeHtml(item.title)}</h3>
          <p><strong>${escapeHtml(x.phase)}:</strong> ${escapeHtml(item.phaseTitle)}</p>
          <p><strong>${escapeHtml(x.status)}:</strong> ${escapeHtml(localizedStatus(ts.status))}</p>
          <p><strong>${escapeHtml(x.observation)}:</strong> ${escapeHtml(ts.note || x.notProvided)}</p>
          <p><strong>${escapeHtml(x.source)}:</strong> ${escapeHtml(ts.source || x.notProvided)}</p>
        </section>`;
      }).join("")
    : `<p>${escapeHtml(x.noFindings)}</p>`;

  const pending = pendingCore.length
    ? `<ul>${pendingCore.map(i => `<li>${escapeHtml(i.title)} — ${escapeHtml(i.phaseTitle)}</li>`).join("")}</ul>`
    : `<p>${escapeHtml(x.noOpenCore)}</p>`;

  const summary = documented.length ? x.documented(documented.length,pendingCore.length) : x.noFindingsSummary(pendingCore.length);

  const html = `<!doctype html>
  <html lang="${escapeHtml(currentLang)}"><head><meta charset="utf-8"><title>${escapeHtml(x.title)}</title>
  <style>
    body{font-family:Arial,sans-serif;color:#111;max-width:920px;margin:40px auto;padding:0 24px;line-height:1.5}
    h1{font-size:32px;margin-bottom:6px} h2{margin-top:34px;border-bottom:1px solid #bbb;padding-bottom:7px}
    h3{margin-bottom:6px} section{break-inside:avoid;margin-bottom:22px}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px;background:#f3f3f3;padding:16px}
    .muted{color:#666;font-size:12px}
    @media print{body{margin:0;max-width:none}.no-print{display:none}}
  </style></head><body>
    <button class="no-print" onclick="window.print()">${escapeHtml(x.print)}</button>
    <h1>${escapeHtml(x.title)}</h1>
    <p class="muted">${escapeHtml(x.generated)} ${escapeHtml(new Date().toISOString())}</p>
    <div class="meta">
      <div><strong>${escapeHtml(x.caseRef)}:</strong> ${escapeHtml(state.meta.caseRef || x.notProvided)}</div>
      <div><strong>${escapeHtml(x.analyst)}:</strong> ${escapeHtml(state.meta.analyst || x.notProvided)}</div>
      <div><strong>${escapeHtml(x.profile)}:</strong> ${escapeHtml(localizedProfile(state.meta.profile))}</div>
      <div><strong>${escapeHtml(x.progress)}:</strong> ${p.done}/${p.total} (${p.pct}%)</div>
    </div>
    <h2>${escapeHtml(x.executive)}</h2>
    <p>${escapeHtml(state.meta.objective ? `${x.objectivePrefix} ${state.meta.objective}` : x.noObjective)}</p>
    <p>${escapeHtml(summary)}</p>
    <h2>${escapeHtml(x.scope)}</h2><p>${escapeHtml(state.meta.scope || x.notProvided)}</p>
    <h2>${escapeHtml(x.context)}</h2><p>${escapeHtml(state.meta.context || x.notProvided)}</p>
    <h2>${escapeHtml(x.findings)}</h2>${findings}
    <h2>${escapeHtml(x.openCore)}</h2>${pending}
    <h2>${escapeHtml(x.caveatHeading)}</h2><p>${escapeHtml(x.caveat)}</p>
  </body></html>`;

  const w = window.open("", "_blank");
  if (!w) {
    alert(t().popupBlocked);
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function renderInsights() {
  const x = t().process;
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
  }).filter(p => p.total && p.pct < 50);

  const block = (title, desc, entries) => {
    const list = entries.length
      ? `<ul>${entries.slice(0,12).map(entry => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>`
      : `<p>${escapeHtml(x.none)}</p>`;
    return `<div class="insight-block"><h3>${escapeHtml(title)}</h3><p class="small muted">${escapeHtml(desc)}</p>${list}</div>`;
  };

  $("insightsContent").innerHTML =
    block(x.openCore, x.openCoreDesc, openCore.map(i => `${i.title} — ${i.phaseTitle}`)) +
    block(x.undocumented, x.undocumentedDesc, undocumentedDone.map(i => i.title)) +
    block(x.noSource, x.noSourceDesc, notesWithoutSource.map(i => i.title)) +
    block(x.weak, x.weakDesc, weakPhases.map(p => `${p.title}: ${p.done}/${p.total} (${p.pct}%)`));

  $("insightsDialog").showModal();
}

function resetCase() {
  if (!confirm(t().resetConfirm)) return;
  localStorage.removeItem(STORAGE_KEY);
  state = {
    meta: { caseRef:"", profile:"all", objective:"", scope:"", urgency:"normal", analyst:"", context:"" },
    tasks: {}
  };
  applyUiText();
  syncMetaToInputs();
  renderChecklist();
  updateProgress();
}

async function init() {
  loadState();

  try {
    model = await loadLocalizedModel(currentLang);
  } catch (error) {
    console.error(error);
    $("checklist").innerHTML = `<div class="empty">${escapeHtml(t().loadError)}</div>`;
    return;
  }

  applyUiText();
  syncMetaToInputs();
  bindMeta();

  $("languageSelect").addEventListener("change", async () => {
    try {
      await setLanguage($("languageSelect").value);
    } catch (error) {
      console.error(error);
      alert(t().loadError);
    }
  });

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
