# Privacy & Data Handling

This project is **local-first by design**.

The application has no backend and no case database. Case state is stored in the browser's local storage unless the analyst explicitly exports it.

That reduces unnecessary data movement. It does not magically make poor data-handling decisions good ones. Software remains stubbornly unable to replace judgment.

## Recommended case-data model

Prefer:

- case reference instead of a real person's name;
- entity aliases instead of unnecessary identifiers;
- evidence IDs instead of copying sensitive content into free-text notes;
- a short description of an exposure instead of storing exposed credentials or secrets;
- links/references to approved evidence stores rather than duplicating material.

## Do not store

The workbench should not be used to retain:

- passwords;
- authentication tokens;
- private keys;
- session cookies;
- secrets or credentials from exposed datasets;
- sensitive information unrelated to the intelligence requirement;
- personal data collected “just in case”.

## Exported files

JSON, Markdown and printed/PDF exports leave the browser and become ordinary files.

Once exported:

- protect them according to the case classification;
- restrict access;
- use an approved storage location;
- apply retention/deletion policy;
- avoid uploading real case files into public GitHub issues or repositories.

## Browser storage

The Reset button clears the current workbench state from this application's local-storage key in the browser.

It does not erase:

- downloaded exports;
- browser history;
- screenshots;
- evidence saved elsewhere;
- files stored by other tools.

## Public repository contributions

Examples, screenshots and labs contributed to this public repository should use synthetic, public-domain or explicitly authorized data.

Do not submit real victim, client or target PII merely to demonstrate the checklist.
