import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import * as cheerio from "cheerio";

const root = process.cwd();
const publicRoot = path.resolve(root, "public");
const run = new Date().toISOString().replace(/[:.]/g, "-");
const archiveRoot = path.resolve(root, "audit/image-originals", run);
const stageRoot = path.resolve(root, "audit/image-work", run);
const manifestFile = path.resolve(root, "src/data/image-manifest.json");
const manifest = fs.existsSync(manifestFile)
  ? JSON.parse(fs.readFileSync(manifestFile, "utf8"))
  : {};
const limit = 499_000;
const imagePattern = /\.(png|jpe?g|webp|avif|gif|svg|ico|bmp|tiff?)$/i;
const records = [];
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : [path.join(dir, entry.name)],
    );
const hash = (data) => crypto.createHash("sha256").update(data).digest("hex");
function ensureInside(base, file) {
  const relative = path.relative(base, path.resolve(file));
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative))
    throw new Error("Unsafe asset path: " + file);
}
function write(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}
let queue = walk(publicRoot)
  .filter((file) => imagePattern.test(file))
  .map((file) => {
    const relative = path.relative(publicRoot, file).replaceAll("\\", "/");
    return {
      source: "/" + relative,
      file,
      target: /\.webp$/i.test(file) ? "/" + relative : "/" + relative + ".webp",
    };
  });

// A re-uploaded PNG/JPEG takes precedence over its previously generated WebP.
// Do not let two concurrent jobs write different versions of the same target.
const replacedTargets = new Set(
  queue
    .filter((item) => item.source !== item.target)
    .map((item) => item.target),
);
queue = queue.filter(
  (item) => item.source !== item.target || !replacedTargets.has(item.target),
);

// Cache only the exact supplier images already present in published content.
const external = new Set();
for (const dataFile of ["src/data/legacy.json", "src/data/blogs.json"]) {
  for (const entry of JSON.parse(fs.readFileSync(dataFile, "utf8"))) {
    const $ = cheerio.load(entry.html || "");
    $("img[src]").each((_, image) => {
      const source = $(image).attr("src");
      if (
        /^https?:\/\//i.test(source || "") &&
        !/https?:\/\/(www\.)?exelciusautomation\.com\//i.test(source)
      )
        external.add(source);
    });
  }
}
for (const source of external) {
  if (
    manifest[source] &&
    fs.existsSync(path.join(publicRoot, manifest[source]))
  )
    continue;
  const response = await fetch(source, { signal: AbortSignal.timeout(30000) });
  if (!response.ok)
    throw new Error(
      `Supplier image could not be cached: ${response.status} ${source}`,
    );
  const data = Buffer.from(await response.arrayBuffer());
  await sharp(data).metadata();
  const name = decodeURIComponent(path.basename(new URL(source).pathname));
  const file = path.join(stageRoot, "downloaded", name);
  write(file, data);
  queue.push({
    source,
    file,
    target: "/images/external/" + name + ".webp",
    external: true,
  });
}

async function encode(item) {
  const original = fs.readFileSync(item.file);
  let input = original;
  if (/\.ico$/i.test(item.file)) {
    if (process.platform !== "win32")
      throw new Error(
        "ICO conversion requires a Windows decoder: " + item.file,
      );
    const decoded = path.join(stageRoot, "decoded", hash(original) + ".png");
    fs.mkdirSync(path.dirname(decoded), { recursive: true });
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "Add-Type -AssemblyName System.Drawing; $taskIcon = [Drawing.Icon]::new($env:CODEX_IMAGE_INPUT, 256, 256); $taskBitmap = $taskIcon.ToBitmap(); $taskBitmap.Save($env:CODEX_IMAGE_OUTPUT, [Drawing.Imaging.ImageFormat]::Png); $taskBitmap.Dispose(); $taskIcon.Dispose();",
      ],
      {
        env: {
          ...process.env,
          CODEX_IMAGE_INPUT: item.file,
          CODEX_IMAGE_OUTPUT: decoded,
        },
        windowsHide: true,
        stdio: "pipe",
      },
    );
    input = decoded;
  }
  const metadata = await sharp(input, { animated: true }).metadata();
  const width = metadata.autoOrient?.width || metadata.width;
  const height = metadata.autoOrient?.height || metadata.height;
  let encoded,
    quality = null;
  if (metadata.format === "webp" && original.length <= limit)
    encoded = original;
  else {
    for (const value of [
      92, 86, 80, 74, 68, 62, 56, 50, 44, 38, 30, 22, 14, 6,
    ]) {
      encoded = await sharp(input, { animated: true })
        .autoOrient()
        .webp({ quality: value, alphaQuality: 100, effort: 4 })
        .toBuffer();
      quality = value;
      if (encoded.length <= limit) break;
    }
  }
  if (encoded.length > limit)
    throw new Error(
      "Cannot meet the byte limit without resizing: " + item.source,
    );
  const result = await sharp(encoded, { animated: true }).metadata();
  if (
    result.format !== "webp" ||
    result.width !== width ||
    result.height !== height
  )
    throw new Error("Image dimensions or format changed: " + item.source);
  const staged = path.join(stageRoot, "encoded", item.target.slice(1));
  ensureInside(stageRoot, staged);
  write(staged, encoded);
  records.push({
    ...item,
    staged,
    width,
    height,
    quality,
    before: original.length,
    after: encoded.length,
    originalHash: hash(original),
    encodedHash: hash(encoded),
  });
  if (records.length % 40 === 0 || records.length === queue.length)
    console.log(`Encoded ${records.length}/${queue.length} images`);
}
let index = 0;
await Promise.all(
  Array.from({ length: 2 }, async () => {
    while (index < queue.length) await encode(queue[index++]);
  }),
);

// No public files change until every candidate has passed size/format checks.
for (const item of records) {
  const destination = path.join(publicRoot, item.target.slice(1));
  ensureInside(publicRoot, destination);
  const relative = item.external
    ? "external/" + path.basename(item.file)
    : path.relative(publicRoot, item.file);
  const backup = path.join(archiveRoot, relative);
  ensureInside(archiveRoot, backup);
  fs.mkdirSync(path.dirname(backup), { recursive: true });
  fs.copyFileSync(item.file, backup);
  if (hash(fs.readFileSync(backup)) !== item.originalHash)
    throw new Error("Original backup verification failed: " + item.source);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(item.staged, destination);
  manifest[item.source] = item.target;
}
write(manifestFile, JSON.stringify(manifest, null, 2));
for (const item of records) {
  if (
    !item.external &&
    path.resolve(item.file) !== path.resolve(publicRoot, item.target.slice(1))
  ) {
    ensureInside(publicRoot, item.file);
    const converted = path.join(publicRoot, item.target.slice(1));
    if (hash(fs.readFileSync(converted)) !== item.encodedHash)
      throw new Error("Converted asset verification failed: " + item.source);
    fs.unlinkSync(item.file);
  }
}
const finalFiles = walk(publicRoot).filter((file) => imagePattern.test(file));
const failures = finalFiles.filter(
  (file) => !/\.webp$/i.test(file) || fs.statSync(file).size >= 500000,
);
if (failures.length)
  throw new Error("Final image audit failed: " + failures.join(", "));
const report = {
  generatedAt: new Date().toISOString(),
  limitBytes: 500000,
  targetBytes: limit,
  images: finalFiles.length,
  beforeBytes: records.reduce((sum, r) => sum + r.before, 0),
  afterBytes: finalFiles.reduce((sum, f) => sum + fs.statSync(f).size, 0),
  maxBytes: Math.max(...finalFiles.map((f) => fs.statSync(f).size)),
  dimensionsPreserved: true,
  originals: path.relative(root, archiveRoot),
  externalImagesCached: external.size,
  records: records.map(({ file, staged, ...item }) => item),
};
write(
  path.resolve("audit/image-optimization-report.json"),
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    {
      images: report.images,
      beforeMB: report.beforeBytes / 1000000,
      afterMB: report.afterBytes / 1000000,
      maxKB: report.maxBytes / 1000,
      dimensionsPreserved: true,
      originals: report.originals,
    },
    null,
    2,
  ),
);
