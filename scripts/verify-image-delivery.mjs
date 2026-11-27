import fs from "node:fs";
import crypto from "node:crypto";
import manifest from "../src/data/image-manifest.json" with { type: "json" };

const base = process.env.VERIFY_URL || "http://127.0.0.1:3000";
const local = Object.entries(manifest).filter(([source]) =>
  source.startsWith("/"),
);
const requests = new Map(local.map(([source, target]) => [source, target]));
for (const target of Object.values(manifest)) requests.set(target, target);
const expected = new Map(
  [...new Set(requests.values())].map((target) => {
    const bytes = fs.readFileSync("public" + target);
    return [
      target,
      {
        bytes: bytes.length,
        hash: crypto.createHash("sha256").update(bytes).digest("hex"),
      },
    ];
  }),
);
const queue = [...requests],
  issues = [];
let index = 0,
  done = 0;
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (index < queue.length) {
      const [source, target] = queue[index++];
      try {
        const response = await fetch(base + encodeURI(source), {
          headers: { connection: "close" },
          signal: AbortSignal.timeout(20000),
        });
        const bytes = Buffer.from(await response.arrayBuffer());
        if (response.status !== 200) throw new Error("HTTP " + response.status);
        if (response.headers.get("content-type") !== "image/webp")
          throw new Error(
            "Unexpected MIME " + response.headers.get("content-type"),
          );
        if (bytes.length >= 500000) throw new Error("Image exceeds 500 KB");
        if (
          crypto.createHash("sha256").update(bytes).digest("hex") !==
          expected.get(target).hash
        )
          throw new Error("Wrong image delivered by alias");
      } catch (error) {
        issues.push({ source, target, error: error.message });
      }
      done++;
      if (done % 150 === 0)
        console.log(`Checked ${done}/${queue.length} image URLs`);
    }
  }),
);
const report = {
  checkedAt: new Date().toISOString(),
  requests: queue.length,
  legacyAliases: local.filter(([source, target]) => source !== target).length,
  allWebP: issues.length === 0,
  allUnder500KB: issues.length === 0,
  issues,
};
fs.writeFileSync(
  "audit/image-delivery-check.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
if (issues.length) process.exitCode = 1;
