# Methodology

The checklist is designed around a simple idea: **procedural completeness and analytic confidence are different things**.

A completed task means a procedure was performed and documented. It does not mean an identity, attribution, allegation or hypothesis has been proven.

## Investigation loop

The workbench uses the following loop:

```text
QUESTION
  ↓
REQUIREMENT
  ↓
SCOPE + CONSTRAINTS
  ↓
KNOWN FACTS / ASSUMPTIONS
  ↓
COLLECTION PLAN
  ↓
COLLECT
  ↓
PRESERVE + DOCUMENT
  ↓
CORROBORATE
  ↓
ANALYZE ALTERNATIVES
  ↓
ASSESS CONFIDENCE
  ↓
REPORT
  ↓
REVIEW / CLOSE
```

This is intentionally more important than the tool list.

## 1. Direction before collection

Every case starts with:

- a question that can be answered;
- the decision the result should support;
- the audience;
- time, geographic and source constraints;
- a stop condition.

Without these, analysts tend to accumulate data instead of producing intelligence.

## 2. Fact, allegation, assumption and judgment

Use different mental buckets:

| Type | Meaning |
|---|---|
| Observation / fact | Information directly observed in a source |
| Allegation | A claim made by another party |
| Assumption | Something temporarily accepted to structure analysis |
| Inference | Interpretation derived from observations |
| Analytic judgment | A reasoned assessment supported by evidence and uncertainty |

Never promote an allegation or assumption into a fact merely because it appears repeatedly.

## 3. Source traceability

Material findings should record, when applicable:

- source or URL;
- observation timestamp;
- evidence/reference ID;
- relevant context;
- limitations;
- whether the source is primary, derivative or an aggregator.

Multiple pages repeating one original source are not automatically independent corroboration.

## 4. Corroboration

Corroboration is stronger when independent sources or different evidence types converge.

Examples of different evidence types can include:

- official public records;
- archived web content;
- public profile statements;
- technical metadata;
- public infrastructure observations;
- independent reporting.

Correlation is not causation, and shared infrastructure is not automatically shared control.

## 5. Uncertainty and alternatives

Before closing a material judgment:

1. identify the evidence supporting it;
2. identify evidence that weakens or contradicts it;
3. consider at least one plausible alternative when uncertainty is material;
4. state confidence and why;
5. record the information gaps that could change the assessment.

## 6. Evidence preservation

For evidence that matters to the case, consider recording:

- original location;
- acquisition/observation time;
- capture method;
- contextual notes;
- file hash where integrity matters;
- storage/reference identifier.

Preserve proportionately. Copying sensitive material merely because it is technically accessible is not good investigative hygiene.

## 7. Reporting

A useful final product should normally contain:

1. **Executive summary / BLUF**
2. Intelligence requirement
3. Scope and limitations
4. Methodology
5. Key judgments
6. Supporting evidence
7. Alternative explanations
8. Confidence / uncertainty
9. Intelligence gaps
10. Recommended next steps or closure rationale

## 8. Process insights

The workbench's “Insights de processo” feature deliberately avoids inventing substantive intelligence.

It flags procedural issues such as:

- core steps still open;
- tasks marked complete with no notes/evidence reference;
- notes with no source/reference;
- phases with low completion.

These are quality-control signals, not conclusions about the investigated subject.

## References

### Berkeley Protocol on Digital Open Source Investigations

OHCHR and the Human Rights Center at UC Berkeley describe professional standards for identifying, collecting, preserving, analysing and presenting digital open-source information.

https://www.ohchr.org/sites/default/files/2022-04/OHCHR_BerkeleyProtocol.pdf

### ICD 203 — Analytic Standards

The Office of the Director of National Intelligence establishes standards including source quality, uncertainty, distinction between information and judgments, alternatives and clear argumentation.

https://www.dni.gov/files/documents/ICD/ICD-203.pdf

### NIST SP 800-86

NIST presents a forensic process centered on collection, examination, analysis and reporting and discusses evidence handling and correlation across data sources.

https://csrc.nist.gov/pubs/sp/800/86/final

### Bellingcat Online Investigation Toolkit

A maintained reference for open-source investigation tools, their use cases, requirements, limitations and ethical considerations.

https://bellingcat.gitbook.io/toolkit

---

These references inform the project. The checklist is not an official implementation or certification of any of them.
