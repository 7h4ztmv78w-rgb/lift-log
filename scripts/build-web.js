const fs = require("node:fs/promises");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "www");
const files = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "sw.js",
  "icon.svg",
  "icon-192.png",
  "icon-512.png",
];

async function build() {
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  await Promise.all(
    files.map(async (file) => {
      await fs.copyFile(path.join(root, file), path.join(outDir, file));
    })
  );
  await fs.writeFile(path.join(outDir, ".nojekyll"), "");

  console.log(`Built ${files.length} web files into ${path.relative(root, outDir)}`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
