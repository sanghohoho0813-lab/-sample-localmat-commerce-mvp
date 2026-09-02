/**
 * 미래에이아이랩 로고 원본을 웹용 에셋으로 준비합니다.
 *
 *   node scripts/prepare-brand.mjs <원본파일>
 *
 * 생성물 (public/brand/):
 *   logo.png  — 전체 로고 락업 (투명 원본은 그대로 복사, 단색 배경이면 투명 처리)
 *   mark.png  — 좌측 심볼(M)만 잘라낸 정사각 (좁은 영역·어두운 배경용)
 *
 * 입력이 이미 투명 배경(PNG RGBA)이면 색상 키잉을 하지 않습니다.
 * 키잉을 하면 배경색과 비슷한 짙은 글자까지 지워지기 때문입니다.
 */
import sharp from "sharp";
import { mkdirSync, existsSync, copyFileSync } from "node:fs";
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

// 이미 투명한 픽셀이 충분히 있으면 "투명 원본"으로 판단합니다.
let transparentPixels = 0;
for (let i = 3; i < data.length; i += ch) {
  if (data[i] < 16) transparentPixels++;
}
const alreadyTransparent = transparentPixels > (width * height) / 20;

const bg = [data[0], data[1], data[2]];
const TOLERANCE = 26;
const isBgColor = (i) =>
  Math.abs(data[i] - bg[0]) <= TOLERANCE &&
  Math.abs(data[i + 1] - bg[1]) <= TOLERANCE &&
  Math.abs(data[i + 2] - bg[2]) <= TOLERANCE;

// 잉크(로고 실체) 판정: 투명 원본은 알파로, 단색 배경 원본은 색상 키잉으로.
const colInk = new Array(width).fill(0);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * ch;
    let ink;
    if (alreadyTransparent) {
      ink = data[i + 3] >= 16;
    } else {
      ink = !isBgColor(i);
      if (!ink) data[i + 3] = 0; // 배경을 투명 처리
    }
    if (ink) colInk[x]++;
  }
}

// logo.png — 투명 원본은 원본 그대로 복사, 아니면 키잉 결과 저장
const keyed = sharp(data, { raw: { width, height, channels: ch } }).png();
if (alreadyTransparent) {
  copyFileSync(SRC, join(OUT, "logo.png"));
} else {
  await keyed.clone().toFile(join(OUT, "logo.png"));
}

// mark.png — 첫 잉크 구간 뒤의 넓은 공백에서 끊어 심볼만 추출
const firstInk = colInk.findIndex((v) => v > 0);
let markEnd = firstInk;
let gap = 0;
const GAP_THRESHOLD = Math.round(width * 0.03);
for (let x = firstInk; x < width; x++) {
  if (colInk[x] === 0) {
    if (++gap >= GAP_THRESHOLD) break;
  } else {
    gap = 0;
    markEnd = x;
  }
}

let top = height;
let bottom = 0;
for (let y = 0; y < height; y++) {
  for (let x = firstInk; x <= markEnd; x++) {
    const i = (y * width + x) * ch;
    const ink = alreadyTransparent ? data[i + 3] >= 16 : data[i + 3] !== 0;
    if (ink) {
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

const markSource = alreadyTransparent ? sharp(SRC).ensureAlpha().png() : keyed.clone();

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
      input: await markSource
        .extract({ left: firstInk, top, width: markW, height: markH })
        .toBuffer(),
      left: pad + Math.round((side - markW) / 2),
      top: pad + Math.round((side - markH) / 2),
    },
  ])
  .png()
  .toFile(join(OUT, "mark.png"));

console.log(`원본 ${width}×${height} · ${alreadyTransparent ? "투명 배경 (원본 그대로 사용)" : `단색 배경 rgb(${bg.join(",")}) 투명 처리`}`);
console.log(`logo.png  전체 락업`);
console.log(`mark.png  심볼 ${markW}×${markH} → ${side + pad * 2}px 정사각`);
