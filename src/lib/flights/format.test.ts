import assert from "node:assert/strict";
import { test } from "node:test";
import { escapeHtml } from "./format.ts";

test("escapeHtml encodes markup from ADS-B fields", () => {
  assert.equal(escapeHtml("<img src=x onerror=alert(1)>"), "\u0026lt;img src=x onerror=alert(1)\u0026gt;");
  assert.equal(escapeHtml('N207AX & "OTP"'), "N207AX \u0026amp; \u0026quot;OTP\u0026quot;");
  assert.equal(escapeHtml("ELP"), "ELP");
});
