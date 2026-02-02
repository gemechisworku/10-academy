<<<<<<< HEAD
# 10-academy
10 Academy Challenge
# 10-academy
10 Academy Challenge

Canonicalize

Functions:

- `canonicalize(value)` -> stable JSON string
- `hashCanonical(value)` -> sha256 hex of canonical string

Run tests:

```bash
npm test
```

## Contributions & Changes

- **Retry helper**: added `src/retry.js` implementing `computeBackoffMs` and `retry` with injectable `sleep` and `random` for deterministic tests.
- **Tests**: added `test/retry.test.js` — table-driven unit tests covering jitter modes, retry behavior, sleep calls, and validation.
- **Package script**: updated `package.json` `test` script to run both `test/canonicalize.test.js` and `test/retry.test.js`.
- **Instruction updates**: modified `.github/copilot-instructions.md` to include workflow and tooling guidance used during development.
- **Other files**: added `CHANGE_SUMMARY.md` as a brief changelog for recent edits.

If you'd like these changes pushed to the remote repository, I can finish the merge/rebase and push them — let me know and I'll proceed.
