import crypto from "crypto";

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function serialize(value) {
  if (value === null) return "null";

  const t = typeof value;
  if (t === "boolean") return value ? "true" : "false";
  if (t === "string") return JSON.stringify(value);
  if (t === "number") {
    if (!Number.isFinite(value) || Number.isNaN(value)) {
      throw new TypeError("Number must be finite and not NaN");
    }
    // canonicalize -0 as 0
    if (Object.is(value, -0)) value = 0;
    return String(value);
  }

  if (Array.isArray(value)) {
    // Arrays: preserve order. undefined -> null like JSON.stringify
    const parts = value.map((el) => (el === undefined ? "null" : serialize(el)));
    return `[${parts.join(",")}]`;
  }

  if (isPlainObject(value)) {
    // collect own enumerable string keys (omit undefined)
    const keys = Object.keys(value).filter((k) => value[k] !== undefined);
    keys.sort();
    const parts = keys.map((k) => `${JSON.stringify(k)}:${serialize(value[k])}`);
    return `{${parts.join(",")}}`;
  }

  if (t === "undefined") {
    throw new TypeError("Cannot canonicalize undefined as a top-level value");
  }

  throw new TypeError(`Unsupported value type: ${t}`);
}

export function canonicalize(value) {
  return serialize(value);
}

export function hashCanonical(value) {
  const s = canonicalize(value);
  const h = crypto.createHash("sha256").update(s, "utf8").digest("hex");
  return h.toLowerCase();
}

export default canonicalize;
