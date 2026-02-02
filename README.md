# 10-academy

A small utility project that provides deterministic canonicalization utilities and a production-safe, testable retry helper with exponential backoff and jitter.

This repository includes:

- `src/canonicalize.js` — deterministic canonical JSON serialization and hashing helpers.
- `src/retry.js` — `computeBackoffMs` and `retry` implementations with injectable `sleep` and `random` for deterministic tests.
- `test/` — unit tests for canonicalize and retry functionality.

## Quick Start

Requirements: Node.js 16+ (or a recent Node that supports ESM).

Install / run tests:

```bash
# run all tests
npm test
```

## Retry Helper (overview)

The retry helper exposes two functions:

- `computeBackoffMs(attempt: number, opts: Options): number` — compute the delay (ms) for a given 1-based attempt index.
- `retry<T>(fn: () => Promise<T>, opts: Options): Promise<T>` — retry a promise-returning function using exponential backoff and jitter.

Options (shape):

- `maxAttempts: number` — total attempts including the initial call (must be >= 1).
- `baseDelayMs: number` — base delay in milliseconds (>= 0).
- `maxDelayMs: number` — maximum allowed delay (cap) in ms (>= 0).
- `multiplier: number` — exponential multiplier (>= 1).
- `jitter: "none" | "full" | "equal"` — jitter mode.
- `retryable: (err: unknown) => boolean` — predicate to decide whether an error is retryable.
- `sleep: (ms: number) => Promise<void>` — injectable sleep function (useful for tests).
- `random: () => number` — injectable RNG that returns in [0,1) (useful for deterministic tests).

Backoff rules:

- Exponential delay = `baseDelayMs * multiplier^(attempt-1)`, capped at `maxDelayMs`.
- Jitter modes:
  - `none`: return `floor(cappedDelay)`.
  - `full`: return `floor(random() * cappedDelay)`.
  - `equal`: return `floor(cappedDelay/2 + random() * (cappedDelay/2))`.

Retry behavior:

- `retry` invokes `fn()` up to `maxAttempts` times.
- If `fn()` rejects and `retryable(err)` is `false`, the error is rethrown immediately.
- If the error is retryable and attempts remain, `computeBackoffMs` is used to compute delay; it awaits the provided `sleep(delay)` then retries.

The implementation validates options and throws helpful errors for invalid inputs (negative delays, multiplier < 1, `maxAttempts` < 1, invalid jitter, etc.).

## Examples

Basic usage (production-like):

```js
import {retry} from './src/retry.js';

const opts = {
  maxAttempts: 4,
  baseDelayMs: 100,
  maxDelayMs: 1000,
  multiplier: 2,
  jitter: 'none',
  retryable: () => true,
  sleep: ms => new Promise(r => setTimeout(r, ms)),
  random: Math.random,
};

await retry(async () => {
  // do a call that may fail transiently
}, opts);
```

Testing example (deterministic):

```js
import {computeBackoffMs, retry} from './src/retry.js';

const opts = { /* same fields */ random: () => 0.5, sleep: async ms => { /* record ms in tests */ } };
const d = computeBackoffMs(1, opts); // deterministic value
```

## Running tests

Run the repository tests locally with:

```bash
npm test
```

The tests are written to be deterministic by injecting `sleep` and `random` in `opts`.

## Contributing

Contributions are welcome. Suggested workflow:

1. Create a feature branch.
2. Add tests for new behavior.
3. Run `npm test` and ensure everything passes.
4. Open a pull request with a clear description of changes.

If you'd like I can add an ESLint configuration and a `lint` script.

## Changes Summary

- Added `src/retry.js` with `computeBackoffMs` and `retry` implementations and validation.
- Added `test/retry.test.js` with table-driven tests for jitter modes, retry logic, sleep calls, and validation.
- Updated `package.json` test script to run both `test/canonicalize.test.js` and `test/retry.test.js`.

## Author / Maintainer

- Created by Gemechis worku.
- Email: game.worku@gmail.com

## Contributions & Changes

- **Retry helper**: added `src/retry.js` implementing `computeBackoffMs` and `retry` with injectable `sleep` and `random` for deterministic tests.
- **Tests**: added `test/retry.test.js` — table-driven unit tests covering jitter modes, retry behavior, sleep calls, and validation.
- **Package script**: updated `package.json` `test` script to run both `test/canonicalize.test.js` and `test/retry.test.js`.
- **Instruction updates**: modified `.github/copilot-instructions.md` to include workflow and tooling guidance used during development.
- **Other files**: added `CHANGE_SUMMARY.md` as a brief changelog for recent edits.

If you'd like these changes pushed to the remote repository, I can finish the merge/rebase and push them — let me know and I'll proceed.

## Changes Summary

- `src/retry.js`: added deterministic retry helper with `computeBackoffMs` and `retry`.
- `test/retry.test.js`: added unit tests covering jitter modes, retry rules, and validation.
- `package.json`: updated `test` script to include the new test file.
- `.github/copilot-instructions.md`: updated with development and workflow notes used during implementation.
- `CHANGE_SUMMARY.md`: added as a small changelog for the recent edits.
