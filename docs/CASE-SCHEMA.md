# Case Schema v3

The application is local-first. A case bundle exported by v0.3 uses:

```json
{
  "schema": "osintchecklist.case.v3",
  "appVersion": "0.3.0",
  "exportedAt": "ISO-8601 timestamp",
  "locale": "pt-BR | en | es",
  "state": {
    "schemaVersion": 3,
    "meta": {},
    "tasks": {},
    "evidence": [],
    "entities": [],
    "relationships": [],
    "timeline": [],
    "findings": [],
    "logbook": [],
    "uiMode": "quick | full"
  }
}
```

## Stable IDs

The workbench uses human-readable identifiers:

| Object | Prefix | Example |
|---|---|---|
| Evidence | `EV` | `EV-001` |
| Entity | `EN` | `EN-001` |
| Relationship | `RL` | `RL-001` |
| Timeline event | `TL` | `TL-001` |
| Finding | `FD` | `FD-001` |
| Logbook entry | `LG` | `LG-001` |
| Checklist task | phase prefix | `src-06` |

IDs are references, not proof of a relationship.

## Evidence object

Typical fields:

- `id`
- `title`
- `type`
- `observedAt`
- `sourceRef`
- `reliability`
- `credibility`
- `taskId`
- `hash`
- `notes`

## Entity object

Typical fields:

- `id`
- `label`
- `type`
- `aliases`
- `notes`

Prefer aliases or case references instead of unnecessary PII.

## Relationship object

A relationship stores:

- source entity;
- target entity;
- explicit relationship type;
- confidence;
- supporting evidence IDs;
- notes.

The graph must not imply causality simply because two entities are close.

## Timeline object

Timeline events can reference both entities and evidence.

Dates should be normalized before using ordering as analytical support.

## Finding object

Findings distinguish:

- **observation**;
- **analytic judgment**;
- **intelligence gap**.

A material analytic judgment should normally identify supporting evidence, confidence and relevant caveats.

## Logbook object

The logbook is an activity trail. In Quick Log mode, task-state changes create entries automatically.

It records **what the analyst did**, not whether the underlying hypothesis became true.

## Compatibility

v0.3 imports:

- v3 case bundles;
- v2 case bundles;
- legacy v1/local states where metadata and task state are available.

New objects are initialized empty when importing older states.
