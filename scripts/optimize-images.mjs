/**
 * 원본 상품/농가 사진을 웹 배포용 WebP로 변환합니다.
 *
 *   node scripts/optimize-images.mjs <원본디렉터리>
 *
 * 원본 디렉터리 구조:
 *   <원본디렉터리>/products/{slug}.(png|jpg)
 *   <원본디렉터리>/farms/{slug}.(png|jpg)
 *
 * 결과물은 public/images/{products,farms}/{slug}.webp 로 저장되며,
 * 상품은 1:1, 농가는 16:9 비율로 강제 크롭됩니다.
 */
import sharp from "sharp";
import { readdirSync, mkdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = process.argv[2];
const DEST = join(ROOT, "public", "images");

if (!RAW || !existsSync(RAW)) {
  console.error("사용법: node scripts/optimize-images.mjs <원본디렉터리>");
  process.exit(1);
}

const specs = [
  { kind: "products", width: 1000, height: 1000 },
  { kind: "farms", width: 1600, height: 900 },
];

const SOURCE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);
let totalIn = 0;
let totalOut = 0;

for (const { kind, width, height } of specs) {
  const srcDir = join(RAW, kind);
  if (!existsSync(srcDir)) continue;
  mkdirSync(join(DEST, kind), { recursive: true });

  for (const file of readdirSync(srcDir)) {
    if (!SOURCE_EXT.has(extname(file).toLowerCase())) continue;
    const src = join(srcDir, file);
    const slug = basename(file, extname(file));
    const out = join(DEST, kind, `${slug}.webp`);

    await sharp(src)
      .resize(width, height, { fit: "cover", position: "attention" })
      .webp({ quality: 80, effort: 6 })
      .toFile(out);

    const inSize = statSync(src).size;
    const outSize = statSync(out).size;
    totalIn += inSize;
    totalOut += outSize;
    console.log(
      `${kind}/${slug}: ${(inSize / 1024 / 1024).toFixed(2)}MB -> ${(outSize / 1024).toFixed(0)}KB`
    );
  }
}

if (totalIn === 0) {
  console.log("변환할 이미지를 찾지 못했습니다.");
} else {
  console.log("---");
  console.log(
    `합계 ${(totalIn / 1024 / 1024).toFixed(1)}MB -> ${(totalOut / 1024 / 1024).toFixed(2)}MB ` +
      `(${((1 - totalOut / totalIn) * 100).toFixed(1)}% 절감)`
  );
}
