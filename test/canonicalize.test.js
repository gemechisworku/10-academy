import assert from "assert";
import {canonicalize, hashCanonical} from "../src/canonicalize.js";

function shouldEqual(a, b, msg) {
  const ca = canonicalize(a);
  const cb = canonicalize(b);
  assert.strictEqual(ca, cb, msg || `${ca} !== ${cb}`);
}

function testTable() {
  const tests = [
    {name: "null", v: null, expect: "null"},
    {name: "boolean true", v: true, expect: "true"},
    {name: "string escape", v: "a\"b", expect: JSON.stringify("a\"b")},
    {name: "number", v: 1.5, expect: "1.5"},
    {name: "-0 becomes 0", v: -0, expect: "0"},
    {name: "array preserve order", v: [1, 2, 3], expect: "[1,2,3]"},
    {name: "omit undefined object key", v: {a:1, b:undefined}, expect: "{\"a\":1}"},
    {name: "object key sort", v: {b:1,a:2}, expect: "{\"a\":2,\"b\":1}"},
    {name: "nested sort", v: {a:[{b:2,a:1}]}, expect: "{\"a\":[{\"a\":1,\"b\":2}] }"},
  ];

  for (const t of tests) {
    const out = canonicalize(t.v);
    if (t.name === "nested sort") {
      // minor formatting: remove space before closing brace
      const normalized = out.replace(/\}\]}/, "}]}");
      assert.strictEqual(normalized, '{"a":[{"a":1,"b":2}]}');
    } else {
      assert.strictEqual(out, t.expect, `${t.name} failed: ${out} !== ${t.expect}`);
    }
  }

  // equality tests
  shouldEqual({a:1,b:undefined}, {a:1});
  shouldEqual({b:1,a:2}, {a:2,b:1});

  // hashing deterministic
  const h1 = hashCanonical({x:1,y:2});
  const h2 = hashCanonical({y:2,x:1});
  assert.strictEqual(h1, h2, "hash must be order independent for objects");

  console.log("All tests passed");
}

testTable();
