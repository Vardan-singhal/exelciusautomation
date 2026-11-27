import { execFileSync } from "node:child_process";
for (const script of ["audit", "prepare", "sync-seo", "optimize-images"])
  execFileSync(process.execPath, ["scripts/" + script + ".mjs"], {
    stdio: "inherit",
  });
