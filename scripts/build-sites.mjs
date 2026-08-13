import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { extname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const analysisRoot = "analysis/huggingface-regime-coverage-2026-08-13";
const outputDir = resolve(root, "dist/server");

const files = new Map([
  ["/", "site/index.html"],
  ["/index.html", "site/index.html"],
  ["/og.png", "public/og.png"],
  [`/${analysisRoot}/README.md`, `${analysisRoot}/README.md`],
  [`/${analysisRoot}/coverage.csv`, `${analysisRoot}/coverage.csv`],
  [`/${analysisRoot}/coverage.svg`, `${analysisRoot}/coverage.svg`],
  [`/${analysisRoot}/query.sql`, `${analysisRoot}/query.sql`],
  [`/${analysisRoot}/render_coverage.py`, `${analysisRoot}/render_coverage.py`],
]);

const contentTypes = {
  ".csv": "text/csv; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".py": "text/plain; charset=utf-8",
  ".sql": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
};

const assets = Object.fromEntries(
  [...files].map(([route, source]) => {
    const body = readFileSync(resolve(root, source)).toString("base64");
    const type = contentTypes[extname(source)] ?? "application/octet-stream";
    return [route, { body, type }];
  }),
);

const worker = `const assets = ${JSON.stringify(assets)};

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const asset = assets[url.pathname];
    if (!asset) {
      return new Response("Not found", { status: 404 });
    }

    let body = decodeBase64(asset.body);
    if (asset.type.startsWith("text/html")) {
      body = new TextDecoder()
        .decode(body)
        .replaceAll("__SITE_ORIGIN__", url.origin);
    }

    return new Response(body, {
      headers: {
        "Content-Type": asset.type,
        "Cache-Control": asset.type.startsWith("text/html")
          ? "public, max-age=0, must-revalidate"
          : "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
};
`;

rmSync(resolve(root, "dist"), { force: true, recursive: true });
mkdirSync(outputDir, { recursive: true });
writeFileSync(resolve(outputDir, "index.js"), worker);
console.log(`Built Sites Worker with ${files.size} routes.`);
