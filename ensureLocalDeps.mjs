// Ensures node_modules/react-sync-board correctly links to the ../reactsyncboard
// sibling checkout. npm bakes an *absolute* path into this link at install time,
// so moving the repo (or its sibling) to a different drive letter/location leaves
// a stale, broken link. This recomputes and repairs it before dev:all runs.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const linkPath = path.join(root, "node_modules", "react-sync-board");
const targetPath = path.resolve(root, "..", "reactsyncboard");

function isValidLink() {
  try {
    return fs.existsSync(path.join(linkPath, "package.json"));
  } catch {
    return false;
  }
}

if (!isValidLink()) {
  if (!fs.existsSync(path.join(targetPath, "package.json"))) {
    console.error(
      `[ensureLocalDeps] Expected sibling package at ${targetPath} but it was not found.\n` +
        `Clone/checkout react-sync-board next to this repo (as "../reactsyncboard") or run "npm install".`
    );
    process.exit(1);
  }

  fs.rmSync(linkPath, { recursive: true, force: true });
  fs.symlinkSync(targetPath, linkPath, "junction");
  console.log(`[ensureLocalDeps] Relinked react-sync-board -> ${targetPath}`);
}
