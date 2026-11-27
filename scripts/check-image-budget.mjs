import fs from "node:fs";
import path from "node:path";

const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : [path.join(dir, entry.name)],
    );
const files = walk("public").filter((file) =>
  /\.(png|jpe?g|webp|avif|gif|svg|ico|bmp|tiff?)$/i.test(file),
);
const failures = [];
for (const file of files) {
  const header = Buffer.alloc(12),
    descriptor = fs.openSync(file, "r");
  try {
    fs.readSync(descriptor, header, 0, 12, 0);
  } finally {
    fs.closeSync(descriptor);
  }
  if (
    !/\.webp$/i.test(file) ||
    header.toString("ascii", 0, 4) !== "RIFF" ||
    header.toString("ascii", 8, 12) !== "WEBP" ||
    fs.statSync(file).size >= 500000
  )
    failures.push(file);
}
if (failures.length)
  throw new Error(
    "Image budget failed. Run npm run images:optimize before building:\n" +
      failures.join("\n"),
  );
console.log(
  `Image budget passed: ${files.length} WebP files, each below 500,000 bytes.`,
);
