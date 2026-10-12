import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const archiveName = "ace-combat-8-source.zip";
const sourceName = "ace-combat-8";
const directories = ["app", "components", "config", "content", "lib", "public", "scripts", ".github"];
const files = [
  "package.json", "package-lock.json", "README.md", ".gitignore",
  "next.config.ts", "next-env.d.ts", "tsconfig.json", "eslint.config.mjs",
  "postcss.config.js", "tailwind.config.ts",
];
const excluded = new Set([
  "node_modules", ".next", "out", "release", ".git", ".codex", ".agents", ".aws",
  ".playwright-cli", ".DS_Store", "credentials", "secrets",
]);

function shouldExclude(name) {
  return excluded.has(name.toLowerCase()) || name.startsWith(".env")
    || /\.(?:log|zip|tsbuildinfo|pem|key|p12|pfx)$/i.test(name);
}

function copyDirectory(source, destination) {
  mkdirSync(destination, { recursive: true });
  for (const entry of readdirSync(source, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (shouldExclude(entry.name) || entry.isSymbolicLink()) continue;
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    if (entry.isDirectory()) copyDirectory(from, to);
    else if (entry.isFile()) copyFileSync(from, to);
  }
}

const staging = mkdtempSync(join(tmpdir(), "ace-combat-8-package-"));
try {
  const source = join(staging, sourceName);
  mkdirSync(source);
  for (const directory of directories) {
    copyDirectory(join(root, directory), join(source, directory));
  }
  for (const file of files) {
    if (existsSync(join(root, file))) copyFileSync(join(root, file), join(source, file));
  }
  const result = spawnSync("zip", ["-q", "-r", join(staging, archiveName), sourceName], { cwd: staging, encoding: "utf8" });
  if (result.error) throw new Error(`Cannot run zip: ${result.error.message}`);
  if (result.status !== 0) throw new Error(result.stderr.trim() || "ZIP creation failed.");
  const output = join(root, "release", archiveName);
  mkdirSync(dirname(output), { recursive: true });
  copyFileSync(join(staging, archiveName), output);
  console.log(`Source archive created: release/${archiveName} (${(statSync(output).size / 1024 / 1024).toFixed(2)} MB)`);
} finally {
  rmSync(staging, { recursive: true, force: true });
}
