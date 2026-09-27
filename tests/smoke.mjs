import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const code = fs.readFileSync("assets/app.js", "utf8");
const checklist = JSON.parse(fs.readFileSync("data/checklist.json", "utf8"));
const en = JSON.parse(fs.readFileSync("data/translations.en.json", "utf8"));
const es = JSON.parse(fs.readFileSync("data/translations.es.json", "utf8"));

const clone = value => JSON.parse(JSON.stringify(value));

function makeClassList() {
  const values = new Set();
  return {
    add: (...xs) => xs.forEach(x => values.add(x)),
    remove: (...xs) => xs.forEach(x => values.delete(x)),
    toggle(value, force) {
      if (force === undefined) {
        if (values.has(value)) {
          values.delete(value);
          return false;
        }
        values.add(value);
        return true;
      }
      if (force) values.add(value);
      else values.delete(value);
      return Boolean(force);
    },
    contains: value => values.has(value)
  };
}

function makeElement(id = "", tag = "div") {
  const listeners = {};
  return {
    id,
    tagName: tag.toUpperCase(),
    value: "",
    textContent: "",
    innerHTML: "",
    placeholder: "",
    title: "",
    hidden: false,
    checked: false,
    dataset: {},
    className: "",
    classList: makeClassList(),
    style: {},
    children: [],
    files: null,
    open: false,
    onclick: null,
    appendChild(...els) { this.children.push(...els); return els[0]; },
    append(...els) { this.children.push(...els); },
    remove() {},
    addEventListener(evt, cb) { (listeners[evt] ??= []).push(cb); },
    setAttribute() {},
    showModal() { this.open = true; },
    close() { this.open = false; },
    reset() {},
    closest() { return null; },
    async trigger(evt, payload = {}) {
      const event = { preventDefault() {}, target: this, ...payload };
      if (evt === "click" && typeof this.onclick === "function") await this.onclick(event);
      for (const cb of listeners[evt] || []) await cb(event);
    },
    click() { return this.trigger("click"); }
  };
}

const ids = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
const elements = Object.fromEntries(ids.map(id => [id, makeElement(id)]));

for (const match of html.matchAll(/<button[^>]*data-tab="([^"]+)"[^>]*id="([^"]+)"/g)) {
  if (elements[match[2]]) elements[match[2]].dataset.tab = match[1];
}

const tabButtons = Object.values(elements).filter(el => el.dataset.tab);
const tabPanels = [...html.matchAll(/<section class="tab-panel(?: active)?" data-panel="([^"]+)"/g)]
  .map(match => {
    const el = makeElement();
    el.dataset.panel = match[1];
    return el;
  });

const domReady = [];
const documentStub = {
  documentElement: { lang: "en" },
  body: { dataset: {}, appendChild() {} },
  getElementById: id => elements[id] || null,
  querySelector: sel => sel === 'meta[name="description"]' ? { content: "" } : null,
  querySelectorAll: sel => sel === ".tab" ? tabButtons : sel === ".tab-panel" ? tabPanels : [],
  createElement: tag => makeElement("", tag),
  addEventListener(evt, cb) { if (evt === "DOMContentLoaded") domReady.push(cb); }
};

const storage = new Map();
const localStorageStub = {
  getItem: key => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key)
};

const data = {
  "data/checklist.json": checklist,
  "data/translations.en.json": en,
  "data/translations.es.json": es
};

const fetchStub = async url => ({
  ok: Boolean(data[String(url)]),
  status: data[String(url)] ? 200 : 404,
  json: async () => clone(data[String(url)])
});

const fakeWindow = {
  open() {
    return { document: { open() {}, write() {}, close() {} } };
  }
};

const URLStub = {
  createObjectURL() { return "blob:test"; },
  revokeObjectURL() {}
};

const referencedIds = [...code.matchAll(/\$\("([^"]+)"\)/g)].map(m => m[1]);
const missing = [...new Set(referencedIds.filter(id => !ids.includes(id)))];
if (missing.length) throw new Error("Missing HTML IDs: " + missing.join(", "));

new Function(
  "document", "localStorage", "navigator", "fetch", "window", "confirm", "alert",
  "Blob", "URL", "Intl", "structuredClone", code
)(
  documentStub,
  localStorageStub,
  { language: "pt-BR" },
  fetchStub,
  fakeWindow,
  () => true,
  () => {},
  class BlobStub {},
  URLStub,
  Intl,
  clone
);

for (const cb of domReady) await cb();

if (elements.appStatus.textContent !== "READY") {
  throw new Error("Application did not reach READY state: " + elements.appStatus.textContent);
}

const controls = [
  "modeQuickBtn", "modeFullBtn",
  "tabChecklist", "tabEvidence", "tabEntities", "tabTimeline", "tabFindings", "tabLogbook",
  "toggleEvidenceFormBtn", "cancelEvidenceBtn",
  "toggleEntityFormBtn", "cancelEntityBtn",
  "toggleRelationshipFormBtn", "cancelRelationshipBtn",
  "toggleTimelineFormBtn", "cancelTimelineBtn",
  "toggleFindingFormBtn", "cancelFindingBtn",
  "insightsBtn", "closeInsightsBtn",
  "exportBundleBtn", "importBundleBtn", "exportMdBtn", "printBtn",
  "exportLogbookBtn", "resetBtn"
];

for (const id of controls) {
  await elements[id].trigger("click");
}

for (const lang of ["en", "es", "pt-BR"]) {
  elements.languageSelect.value = lang;
  await elements.languageSelect.trigger("change");
}

console.log("PASS: app initialized");
console.log("PASS: HTML/JS IDs are consistent");
console.log("PASS: " + controls.length + " primary button handlers executed");
console.log("PASS: language switching executed for pt-BR, en and es");
