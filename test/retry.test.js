import assert from "assert";
import {computeBackoffMs, retry} from "../src/retry.js";

function runTests() {
  testBackoffJitterModes();
  testRetryStopsWhenRetryableFalse();
  testRetriesAndSleepCalls();
  testValidationThrows();
  console.log("All retry tests passed");
}

function baseOpts(overrides = {}) {
  return Object.assign({
    maxAttempts: 4,
    baseDelayMs: 100,
    maxDelayMs: 1000,
    multiplier: 2,
    jitter: "none",
    retryable: () => true,
    sleep: async () => {},
    random: () => 0.5,
  }, overrides);
}

function testBackoffJitterModes() {
  const caps = [100, 200, 400, 800];
  // none
  {
    const opts = baseOpts({jitter: "none"});
    for (let i = 1; i <= 4; i++) {
      const v = computeBackoffMs(i, opts);
      assert.strictEqual(v, caps[i-1], `none jitter attempt ${i}`);
    }
  }

  // full with random=0.5 -> floor(0.5 * cap)
  {
    const opts = baseOpts({jitter: "full", random: () => 0.5});
    for (let i = 1; i <= 4; i++) {
      const expected = Math.floor(0.5 * caps[i-1]);
      const v = computeBackoffMs(i, opts);
      assert.strictEqual(v, expected, `full jitter attempt ${i}`);
    }
  }

  // equal with random=0.5 -> floor(cap/2 + 0.5*cap/2) = floor(0.75*cap)
  {
    const opts = baseOpts({jitter: "equal", random: () => 0.5});
    for (let i = 1; i <= 4; i++) {
      const expected = Math.floor(0.75 * caps[i-1]);
      const v = computeBackoffMs(i, opts);
      assert.strictEqual(v, expected, `equal jitter attempt ${i}`);
    }
  }
}

function testRetryStopsWhenRetryableFalse() {
  let slept = false;
  const opts = baseOpts({
    maxAttempts: 3,
    retryable: () => false,
    sleep: async (ms) => { slept = true; }
  });

  let called = 0;
  const fn = async () => { called++; throw new Error("fatal"); };

  return retry(fn, opts).then(() => {
    throw new Error("Expected rejection");
  }).catch(err => {
    assert.strictEqual(err.message, "fatal");
    assert.strictEqual(called, 1, "should not retry when retryable is false");
    assert.strictEqual(slept, false, "sleep should not be called");
  });
}

async function testRetriesAndSleepCalls() {
  const sleepCalls = [];
  const opts = baseOpts({
    maxAttempts: 5,
    jitter: "none",
    random: () => 0,
    sleep: async (ms) => { sleepCalls.push(ms); }
  });

  let callCount = 0;
  const fn = async () => {
    callCount++;
    if (callCount <= 2) throw new Error("transient");
    return "success";
  };

  const res = await retry(fn, opts);
  assert.strictEqual(res, "success");
  assert.strictEqual(callCount, 3, "fn called until success");
  // sleep should have been called twice with attempt 1 and 2 delays
  assert.strictEqual(sleepCalls.length, 2);
  assert.strictEqual(sleepCalls[0], computeBackoffMs(1, opts));
  assert.strictEqual(sleepCalls[1], computeBackoffMs(2, opts));
}

function testValidationThrows() {
  assert.throws(() => computeBackoffMs(0, baseOpts()), /attempt must be an integer/);
  assert.throws(() => computeBackoffMs(1, null), /opts must be an object/);
  assert.throws(() => {
    const bad = baseOpts({maxAttempts: 0});
    // call validate via computeBackoffMs
    computeBackoffMs(1, bad);
  }, /maxAttempts must be an integer >= 1/);
  assert.throws(() => {
    const bad = baseOpts({multiplier: 0.5});
    computeBackoffMs(1, bad);
  }, /multiplier must be a number >= 1/);
}

runTests();
