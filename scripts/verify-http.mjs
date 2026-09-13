/**
 * Raw HTTP checks against a real production server.
 *
 * These exist because a browser test is not enough. A 404 that renders only
 * after hydration looks correct in Playwright and is an empty document to
 * `curl` and to a crawler — which is exactly the defect this file now guards
 * against. Everything here is asserted on the response body as it arrives, with
 * no JavaScript executed.
 *
 * Usage: node scripts/verify-http.mjs   (requires a completed `next build`)
 */

import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = Number(process.env.VERIFY_PORT ?? 3999);
const BASE = `http://127.0.0.1:${PORT}`;

/** Strip scripts and tags so assertions see what a reader without JS sees. */
function visibleText(html) {
  return html
    .split("<body")
    .slice(1)
    .join("<body")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const failures = [];

function check(label, condition, detail = "") {
  if (condition) return;
  failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
}

async function get(path) {
  const response = await fetch(`${BASE}${path}`, { redirect: "manual" });
  const html = await response.text();
  return { status: response.status, html, text: visibleText(html) };
}

async function run() {
  // Every unmatched route must resolve to the same server-rendered 404.
  const notFoundPaths = [
    "/ko/nonexistent",
    "/en/nonexistent",
    "/fr",
    "/nonexistent",
    "/ko/writing/nonexistent-slug",
    "/en/writing/nonexistent-slug",
    "/ko/projects/nonexistent-slug",
    "/en/gatherings/nonexistent-slug",
  ];

  for (const path of notFoundPaths) {
    const { status, html, text } = await get(path);
    const at = `404 ${path}`;

    check(at, status === 404, `expected 404, got ${status}`);
    check(at, /페이지를 찾을 수 없습니다/.test(text), "Korean heading missing from server HTML");
    check(at, /Page not found/.test(text), "English heading missing from server HTML");
    check(at, /요청한 페이지가/.test(text), "Korean body copy missing");
    check(at, /may have moved/.test(text), "English body copy missing");
    check(at, /href="\/ko"/.test(html), "no /ko recovery link");
    check(at, /href="\/en"/.test(html), "no /en recovery link");
    check(at, /noindex/.test(html), "no noindex directive");
    check(at, /<html[^>]*lang="ko"/.test(html), "document has no lang");
    check(at, /rel="stylesheet"/.test(html), "no stylesheet linked");
    // The regression that started all this: content present only after hydration.
    check(at, text.length > 80, `server-rendered body too short (${text.length} chars)`);
  }

  // Real pages must be unaffected.
  for (const path of [
    "/",
    "/ko",
    "/en",
    "/ko/about",
    "/en/about",
    "/ko/writing",
    "/en/writing",
    "/sitemap.xml",
    "/robots.txt",
    "/ko/feed.xml",
    "/en/feed.xml",
  ]) {
    const { status } = await get(path);
    check(`200 ${path}`, status === 200, `expected 200, got ${status}`);
  }

  // Locale documents keep their own language.
  for (const [path, lang] of [
    ["/ko", "ko"],
    ["/en", "en"],
    ["/ko/about", "ko"],
    ["/en/about", "en"],
  ]) {
    const { html } = await get(path);
    check(`lang ${path}`, new RegExp(`<html[^>]*lang="${lang}"`).test(html), `expected lang="${lang}"`);
  }

  // Concurrent 404s must not contaminate one another.
  const concurrent = await Promise.all(
    Array.from({ length: 24 }, (_, i) =>
      get(i % 2 === 0 ? "/ko/nonexistent" : "/en/nonexistent"),
    ),
  );
  const bodies = new Set(concurrent.map((r) => r.text));
  check(
    "concurrency",
    concurrent.every((r) => r.status === 404),
    "a concurrent request did not return 404",
  );
  check(
    "concurrency",
    bodies.size === 1,
    `concurrent 404s returned ${bodies.size} different bodies`,
  );
}

// Spawned detached so the whole process group can be torn down: `next start`
// forks, and killing only the parent leaves a server holding the port.
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)],
  { stdio: ["ignore", "pipe", "pipe"], env: process.env, detached: true },
);

let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));

function stopServer() {
  try {
    process.kill(-server.pid, "SIGKILL");
  } catch {
    server.kill("SIGKILL");
  }
}

let exitCode = 0;
try {
  let ready = false;
  for (let i = 0; i < 60; i += 1) {
    try {
      await fetch(`${BASE}/ko`);
      ready = true;
      break;
    } catch {
      await sleep(500);
    }
  }
  if (!ready) throw new Error(`server never became ready\n${serverLog}`);

  await run();
} catch (error) {
  failures.push(String(error));
} finally {
  stopServer();
}

if (failures.length > 0) {
  console.error(`\nverify-http: ${failures.length} failure(s)\n`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  exitCode = 1;
} else {
  console.log("verify-http: all raw HTTP checks passed");
}

// The detached child keeps handles open; exit explicitly rather than hanging.
process.exit(exitCode);
