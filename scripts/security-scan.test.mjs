import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  formatReport,
  listScanFiles,
  parseAuditJson,
  runSecurityScan,
  scanText,
} from "./security-scan.mjs";

const LEAK = ["0c0536b7", "b149fe9b", "c50b9947", "781660b4"].join("");

test("flags a 32-char hex access key literal", () => {
  const hits = scanText("src/lib/flights/aviationstack.server.ts", `const k = "${LEAK}";`);
  assert.ok(hits.some((h) => h.id === "hex-32-literal"));
});

test("flags a named Aviationstack hex secret", () => {
  const hits = scanText(
    "src/lib/x.ts",
    `const access_key = "${LEAK}";\nAVIATIONSTACK_ACCESS_KEY = "${LEAK}";`,
  );
  assert.ok(hits.some((h) => h.id === "named-hex-secret" || h.id === "hex-32-literal"));
});

test("does not flag 6-digit color tokens", () => {
  const hits = scanText("src/lib/flights/format.ts", `return "#c45c4a";`);
  assert.equal(hits.length, 0);
});

test("flags eval and dangerouslySetInnerHTML in app source", () => {
  const hits = scanText("src/components/tracker/x.tsx", `eval("1"); const x = { dangerouslySetInnerHTML: { __html: "a" } };`);
  assert.ok(hits.some((h) => h.id === "eval"));
  assert.ok(hits.some((h) => h.id === "dangerously-set-html"));
});

test("does not flag eval inside the scanner scripts", () => {
  const hits = scanText("scripts/security-scan.mjs", `eval("1")`);
  assert.ok(!hits.some((h) => h.id === "eval"));
});

test("flags server secret names imported from client components", () => {
  const hits = scanText("src/components/tracker/tracker-app.tsx", `const k = process.env.AVIATIONSTACK_ACCESS_KEY;`);
  assert.ok(hits.some((h) => h.id === "client-secret-name"));
});

test("allows server-only files to read the env name", () => {
  const hits = scanText(
    "src/lib/flights/aviationstack.server.ts",
    `return process.env.AVIATIONSTACK_ACCESS_KEY?.trim() || null;`,
  );
  assert.ok(!hits.some((h) => h.id === "client-secret-name"));
});

test("flags CORS * with POST", () => {
  const hits = scanText(
    "src/routes/api/flights.ts",
    `const cors = {\n  "access-control-allow-origin": "*",\n  "access-control-allow-methods": "GET, POST, OPTIONS",\n};`,
  );
  assert.ok(hits.some((h) => h.id === "open-cors-mutations"));
});

test("allows CORS * on GET-only public JSON", () => {
  const hits = scanText(
    "src/routes/api/flights.ts",
    `const cors = {\n  "access-control-allow-origin": "*",\n  "access-control-allow-methods": "GET, OPTIONS",\n};`,
  );
  assert.ok(!hits.some((h) => h.id === "open-cors-mutations"));
});

test("parseAuditJson fails the scan on high/critical", () => {
  const parsed = parseAuditJson(
    JSON.stringify({ metadata: { vulnerabilities: { info: 0, low: 1, moderate: 2, high: 1, critical: 0 } } }),
  );
  assert.equal(parsed.ok, true);
  assert.equal(parsed.high, 1);
  assert.ok(parsed.findings.some((f) => f.id === "npm-audit-high"));
});

test("parseAuditJson is clean when audit is empty", () => {
  const parsed = parseAuditJson(
    JSON.stringify({ metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0 } } }),
  );
  assert.equal(parsed.findings.length, 0);
});

test("listScanFiles skips tests, geojson, and node_modules", () => {
  const root = mkdtempSync(join(tmpdir(), "sec-scan-"));
  mkdirSync(join(root, "src/lib"), { recursive: true });
  mkdirSync(join(root, "scripts"), { recursive: true });
  mkdirSync(join(root, "public/geo"), { recursive: true });
  mkdirSync(join(root, "node_modules/foo"), { recursive: true });
  writeFileSync(join(root, "src/lib/ok.ts"), "export const n = 1;\n");
  writeFileSync(join(root, "scripts/security-scan.test.mjs"), `const k = "${LEAK}";\n`);
  writeFileSync(join(root, "public/geo/countries-110m.geojson"), "{}");
  writeFileSync(join(root, "node_modules/foo/x.js"), `eval("1")`);
  const files = listScanFiles(root).map((f) => f.rel).sort();
  assert.deepEqual(files, ["src/lib/ok.ts"]);
});

test("runSecurityScan on a clean tree is ok", () => {
  const root = mkdtempSync(join(tmpdir(), "sec-scan-clean-"));
  mkdirSync(join(root, "src"), { recursive: true });
  writeFileSync(join(root, "src/ok.ts"), "export const n = 1;\n");
  const report = runSecurityScan(root, { audit: false });
  assert.equal(report.ok, true);
  assert.match(formatReport(report), /no findings/);
});

test("runSecurityScan fails on a leaked key", () => {
  const root = mkdtempSync(join(tmpdir(), "sec-scan-leak-"));
  mkdirSync(join(root, "src/lib/flights"), { recursive: true });
  writeFileSync(join(root, "src/lib/flights/aviationstack.server.ts"), `const k = "${LEAK}";\n`);
  const report = runSecurityScan(root, { audit: false });
  assert.equal(report.ok, false);
  assert.ok(report.findings.some((f) => f.id === "hex-32-literal"));
});
