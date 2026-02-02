export function validateOptions(opts) {
  if (!opts || typeof opts !== "object") throw new TypeError("opts must be an object");
  const {maxAttempts, baseDelayMs, maxDelayMs, multiplier, jitter, retryable, sleep, random} = opts;
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) throw new TypeError("maxAttempts must be an integer >= 1");
  if (typeof baseDelayMs !== "number" || baseDelayMs < 0) throw new TypeError("baseDelayMs must be >= 0");
  if (typeof maxDelayMs !== "number" || maxDelayMs < 0) throw new TypeError("maxDelayMs must be >= 0");
  if (typeof multiplier !== "number" || multiplier < 1) throw new TypeError("multiplier must be a number >= 1");
  if (!["none", "full", "equal"].includes(jitter)) throw new TypeError("jitter must be one of 'none','full','equal'");
  if (typeof retryable !== "function") throw new TypeError("retryable must be a function");
  if (typeof sleep !== "function") throw new TypeError("sleep must be a function");
  if (typeof random !== "function") throw new TypeError("random must be a function");
}

export function computeBackoffMs(attempt, opts) {
  if (!Number.isInteger(attempt) || attempt < 1) throw new TypeError("attempt must be an integer >= 1");
  validateOptions(opts);
  const {baseDelayMs, maxDelayMs, multiplier, jitter, random} = opts;
  const raw = baseDelayMs * Math.pow(multiplier, attempt - 1);
  const capped = Math.min(raw, maxDelayMs);
  switch (jitter) {
    case "none":
      return Math.floor(capped);
    case "full":
      return Math.floor(random() * capped);
    case "equal":
      return Math.floor(capped / 2 + random() * (capped / 2));
    default:
      // unreachable due to validation
      return Math.floor(capped);
  }
}

export async function retry(fn, opts) {
  validateOptions(opts);
  const {maxAttempts, retryable, sleep} = opts;

  for (let attemptNum = 1; attemptNum <= maxAttempts; attemptNum++) {
    try {
      return await fn();
    } catch (err) {
      // If not retryable, rethrow immediately
      try {
        if (!retryable(err)) throw err;
      } catch (e) {
        // If retryable threw or returned false, rethrow original
        throw err;
      }

      // If this was the last allowed attempt, rethrow
      if (attemptNum === maxAttempts) throw err;

      // Wait computed backoff then retry
      const delay = computeBackoffMs(attemptNum, opts);
      await sleep(delay);
    }
  }
}
