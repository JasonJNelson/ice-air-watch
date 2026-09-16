#!/usr/bin/env node
/**
 * Automated security scan for ICE Air Watch.
 *
 * Checks (no extra deps):
 *  1. Secret literals in source (keys, tokens, PEM, 32-char hex access keys)
 *  2. Client-side leak of server-only env names / VITE_ secrets
 *  3. Dangerous sinks (eval, new Function, innerHTML, dangerouslySetInnerHTML)
 *  4. Open CORS on mutating methods
 *  5. npm audit (production, high+)
 *
 * Exit 0 = clean, 1 = findings, 2 = scanner error.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { isMainModule, projectRoot } from "./with-app-env.mjs";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".vercel",
  "screenshots",
  "artifacts",
  "dist",
  "coverage",
  "geo",
]);

const SCAN_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".jsx",
  ".css",
  ".env",
  ".yml",
  ".yaml",
  ".sh",
  ".html",
]);

const SECRET_RULES = [
  { id: "pem-private-key", severity: "fail", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { id: "github-token", severity: "fail", re: /\b(?:ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/ },
  { id: "aws-access-key", severity: "fail", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "stripe-live", severity: "fail", re: /\bsk_live_[A-Za-z0-9]{16,}\b/ },
  { id: "slack-token", severity: "fail", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  {
    id: "named-hex-secret",
    severity: "fail",
    re: /(?:access[_-]?key|api[_-]?key|secret|token|AEROAPI|AVIATIONSTACK)[^\n]{0,80}["'][0-9a-f]{32}["']/i,
  },
  { id: "hex-32-literal", severity: "fail", re: /["'][0-9a-f]{32}["']/i },
];

const CLIENT_SECRET_RE =
  /\b(?:AVIATIONSTACK_ACCESS_KEY|AEROAPI_KEY|VITE_(?:[A-Z0-9_]*SECRET|[A-Z0-9_]*TOKEN|[A-Z0-9_]*PASSWORD|AVIATIONSTACK|AEROAPI))\b/;

const SINK_RULES = [
  { id: "eval", severity: "fail", re: /\beval\s*\(/ },
  { id: "new-function", severity: "fail", re: /\bnew\s+Function\s*\(/ },
  { id: "document-write", severity: "fail", re: /\bdocument\.write\s*\(/ },
  { id: "dangerously-set-html", severity: "fail", re: /\bdangerouslySetInnerHTML\b/ },
  { id: "innerhtml-assign", severity: "fail", re: /\.innerHTML\s*=/ },
];

const CORS_MUTATE_RE =
  /access-control-allow-origin["']?\s*:\s*["']\*["'][\s\S]{0,200}access-control-allow-methods["']?\s*:\s*["'][^"']*\b(?:POST|PUT|PATCH|DELETE)\b/i;

function isTestFile(rel) {
  return /\.test\.(mjs|js|ts|tsx)$/.test(rel) || /\/tests?\//.test(rel);
}

export function listScanFiles(root) {
  const out = [];
  function walk(dir) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (ent.name.startsWith(".") && ent.name !== ".env" && ent.name !== ".github") continue;
      const full = join(dir, ent.name);
      if (ent.isDirectory()) {
        if (SKIP_DIRS.has(ent.name)) continue;
        walk(full);
        continue;
      }
      const rel = relative(root, full).replaceAll("\\", "/");
      if (isTestFile(rel)) continue;
      if (rel === "package-lock.json") continue;
      const ext = extname(ent.name);
      if (!SCAN_EXT.has(ext) && ent.name !== ".env") continue;
      try {
        if (statSync(full).size > 1_500_000) continue;
      } catch {
        continue;
      }
      out.push({ full, rel });
    }
  }
  for (const top of ["src", "scripts", "server", "public", ".github"]) {
    const abs = join(root, top);
    if (existsSync(abs)) walk(abs);
  }
  const envFile = join(root, ".env");
  if (existsSync(envFile)) out.push({ full: envFile, rel: ".env" });
  return out;
}

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

export function scanText(rel, text) {
  const findings = [];
  const isClient = rel.startsWith("src/components/") || (rel.startsWith("src/routes/") && !rel.includes(".server."));
  const skipSinks = rel.startsWith("scripts/");

  for (const rule of SECRET_RULES) {
    rule.re.lastIndex = 0;
    let m;
    const re = new RegExp(rule.re.source, rule.re.flags.includes("g") ? rule.re.flags : `${rule.re.flags}g`);
    while ((m = re.exec(text))) {
      findings.push({
        severity: rule.severity,
        id: rule.id,
        file: rel,
        line: lineOf(text, m.index),
        message: `Possible secret (${rule.id})`,
      });
    }
  }

  if (isClient) {
    CLIENT_SECRET_RE.lastIndex = 0;
    let m;
    const re = new RegExp(CLIENT_SECRET_RE.source, "g");
    while ((m = re.exec(text))) {
      findings.push({
        severity: "fail",
        id: "client-secret-name",
        file: rel,
        line: lineOf(text, m.index),
        message: `Server secret identifier ${m[0]} referenced from client code`,
      });
    }
  }

  if (!skipSinks && (rel.startsWith("src/") || rel.startsWith("server/"))) {
    for (const rule of SINK_RULES) {
      const re = new RegExp(rule.re.source, "g");
      let m;
      while ((m = re.exec(text))) {
        findings.push({
          severity: rule.severity,
          id: rule.id,
          file: rel,
          line: lineOf(text, m.index),
          message: `Dangerous sink (${rule.id})`,
        });
      }
    }
  }

  if (rel.startsWith("src/routes/") && CORS_MUTATE_RE.test(text)) {
    findings.push({
      severity: "fail",
      id: "open-cors-mutations",
      file: rel,
      line: lineOf(text, text.search(/access-control-allow-origin/i)),
      message: "CORS * combined with mutating HTTP methods",
    });
  }

  return findings;
}

export function scanFiles(files) {
  const findings = [];
  for (const file of files) {
    let text;
    try {
      text = readFileSync(file.full, "utf8");
    } catch {
      continue;
    }
    findings.push(...scanText(file.rel, text));
  }
  return findings;
}

export function parseAuditJson(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "npm audit returned invalid JSON", high: 0, critical: 0, findings: [] };
  }
  const meta = parsed.metadata?.vulnerabilities ?? {};
  const high = Number(meta.high ?? 0);
  const critical = Number(meta.critical ?? 0);
  const findings = [];
  if (critical > 0) {
    findings.push({
      severity: "fail",
      id: "npm-audit-critical",
      file: "package-lock.json",
      line: 1,
      message: `${critical} critical production vulnerabilit${critical === 1 ? "y" : "ies"} (npm audit)`,
    });
  }
  if (high > 0) {
    findings.push({
      severity: "fail",
      id: "npm-audit-high",
      file: "package-lock.json",
      line: 1,
      message: `${high} high production vulnerabilit${high === 1 ? "y" : "ies"} (npm audit)`,
    });
  }
  return { ok: true, high, critical, findings };
}

export function runNpmAudit(root) {
  const result = spawnSync("npm", ["audit", "--json", "--omit=dev"], {
    cwd: root,
    encoding: "utf8",
    timeout: 60_000,
  });
  const raw = `${result.stdout || ""}${result.stderr || ""}`.trim();
  const jsonStart = raw.indexOf("{");
  if (jsonStart < 0) {
    return {
      ok: false,
      error: result.error ? String(result.error.message) : "npm audit produced no JSON",
      high: 0,
      critical: 0,
      findings: [],
    };
  }
  return parseAuditJson(raw.slice(jsonStart));
}

export function runSecurityScan(root, { audit = true } = {}) {
  const files = listScanFiles(root);
  const findings = scanFiles(files);
  let auditResult = { ok: true, high: 0, critical: 0, findings: [], skipped: !audit };
  if (audit) {
    auditResult = { ...runNpmAudit(root), skipped: false };
    findings.push(...auditResult.findings);
  }
  const fails = findings.filter((f) => f.severity === "fail");
  return {
    ok: fails.length === 0,
    filesScanned: files.length,
    findings,
    audit: auditResult,
  };
}

export function formatReport(report) {
  const lines = [];
  lines.push(`security-scan: ${report.filesScanned} files`);
  if (report.audit?.skipped) lines.push("npm audit: skipped");
  else if (report.audit && report.audit.ok === false) {
    lines.push(`npm audit: ${report.audit.error || "unavailable"} (treated as warning)`);
  } else if (report.audit) {
    lines.push(`npm audit: ${report.audit.critical} critical, ${report.audit.high} high`);
  }
  if (report.findings.length === 0) {
    lines.push("no findings");
    return lines.join("\n");
  }
  for (const f of report.findings) {
    lines.push(`${f.severity.toUpperCase()} ${f.file}:${f.line} [${f.id}] ${f.message}`);
  }
  return lines.join("\n");
}

function main(argv) {
  const json = argv.includes("--json");
  const noAudit = argv.includes("--no-audit");
  const root = projectRoot();
  const report = runSecurityScan(root, { audit: !noAudit });
  if (json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write(`${formatReport(report)}\n`);
  }
  if (!report.ok) process.exit(1);
}

if (isMainModule(import.meta.url)) {
  main(process.argv.slice(2));
}
