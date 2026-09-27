# Contributing

Contributions are welcome when they improve investigative discipline.

## Good contributions

- missing procedural checks;
- clearer descriptions of why a step matters;
- evidence-handling improvements;
- source-evaluation techniques;
- synthetic training cases;
- accessibility and usability improvements;
- export/report improvements;
- translations.

## Avoid

- adding tools with no stated investigative purpose;
- steps that assume correlation proves identity;
- instructions for unauthorized access;
- real case PII;
- credentials or breach contents;
- claims that a tool result is automatically a verified fact.

## Checklist item style

Each item should answer:

1. **What should the analyst do?**
2. **Why does it matter?**
3. **What mistake does it help prevent?**

Keep task titles short and descriptions operational.

## Data changes

Checklist content lives in:

`data/checklist.json`

Keep IDs stable after release because saved local case state references them.

## Pull requests

Please describe:

- problem being solved;
- phase affected;
- proposed behavior;
- references supporting the method, when applicable;
- privacy or safety impact.
