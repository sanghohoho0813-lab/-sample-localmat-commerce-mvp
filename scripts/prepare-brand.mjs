/**
 * 미래에이아이랩 로고 원본(단색 배경 JPG/PNG)을 웹용 에셋으로 가공합니다.
 *
 *   node scripts/prepare-brand.mjs <원본파일>
 *
 * 생성물 (public/brand/):
 *   logo.png  — 전체 로고 락업, 배경 투명
 *   mark.png  — 좌측 심볼(M)만 잘라낸 정사각, 배경 투명
 *
 * 배경은 좌상단 픽셀 색을 기준으로 근사치를 제거합니다.
 */
import sharp from "sharp";
import { mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = process.argv[2];
const OUT = join(ROOT, "public", "brand");

if (!SRC || !existsSync(SRC)) {
  console.error("사용법: node scripts/prepare-brand.mjs <원본파일>");
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const base = sharp(SRC).ensureAlpha();
const { width, height } = await base.metadata();
const { data, info } = await base.raw().toBuffer({ resolveWithObject: true });
const ch = info.channels;

// 좌상단 픽셀 = 배경색
const bg = [data[0], data[1], data[2]];
const TOLERANCE = 26;

const isBg = (i) =>
  Math.abs(data[i] - bg[0]) <= TOLERANCE &&
  Math.abs(data[i + 1] - bg[1]) <= TOLERANCE &&
  Math.abs(data[i + 2] - bg[2]) <= TOLERANCE;

// 1) 배경 투명 처리 + 잉크 열 분포 수집
const colInk = new Array(width).fill(0);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * ch;
    if (isBg(i)) {
      data[i + 3] = 0;
    } else {
      colInk[x]++;
    }
  }
}

const transparent = sharp(data, { raw: { width, height, channels: ch } }).png();
await transparent.clone().toFile(join(OUT, "logo.png"));

// 2) 심볼(M) 영역 찾기 — 잉크가 있는 첫 구간 뒤의 넓은 공백에서 끊습니다.
const firstInk = colInk.findIndex((v) => v > 0);
let markEnd = firstInk;
let gap = 0;
const GAP_THRESHOLD = Math.round(width * 0.03); // 약 25px 이상 비면 마크와 글자 사이로 판단
for (let x = firstInk; x < width; x++) {
  if (colInk[x] === 0) {
    gap++;
    if (gap >= GAP_THRESHOLD) break;
  } else {
    gap = 0;
    markEnd = x;
  }
}

// 세로 방향 잉크 범위
let top = height;
let bottom = 0;
for (let y = 0; y < height; y++) {
  for (let x = firstInk; x <= markEnd; x++) {
    const i = (y * width + x) * ch;
    if (data[i + 3] !== 0) {
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      break;
    }
  }
}

const markW = markEnd - firstInk + 1;
const markH = bottom - top + 1;
const side = Math.max(markW, markH);
const pad = Math.round(side * 0.06);

await sharp({
  create: {
    width: side + pad * 2,
    height: side + pad * 2,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    {
      input: await transparent
        .clone()
        .extract({ left: firstInk, top, width: markW, height: markH })
        .toBuffer(),
      left: pad + Math.round((side - markW) / 2),
      top: pad + Math.round((side - markH) / 2),
    },
  ])
  .png()
  .toFile(join(OUT, "mark.png"));

console.log(`원본 ${width}×${height}, 배경 rgb(${bg.join(",")})`);
console.log(`logo.png  전체 락업 (배경 투명)`);
console.log(`mark.png  심볼 ${markW}×${markH} → ${side + pad * 2}px 정사각`);
