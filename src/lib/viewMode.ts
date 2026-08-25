export const VIEW_MODE_KEY = "localmat-view-mode";

export type ViewMode = "mobile" | "desktop";

export const DESKTOP_VIEWPORT = "width=1280";
export const MOBILE_VIEWPORT = "width=device-width, initial-scale=1";

/**
 * viewport meta는 layout의 <head>에 단 하나만 렌더링하고 여기서만 조작합니다.
 * 혹시라도 태그가 둘 이상 생기면 첫 번째만 남기고 정리합니다.
 * (중복되면 어떤 폭이 적용될지 브라우저마다 달라집니다.)
 */
function viewportMeta(): HTMLMetaElement | null {
  const all = document.querySelectorAll<HTMLMetaElement>('meta[name="viewport"]');
  for (let i = 1; i < all.length; i++) all[i].remove();
  return all[0] ?? null;
}

/** 첫 페인트 전에 저장된 뷰 모드를 적용해 레이아웃 깜빡임을 막는 인라인 스크립트. */
export const VIEW_MODE_INIT_SCRIPT = `
(function () {
  try {
    if (window.self !== window.top) return;
    if (localStorage.getItem(${JSON.stringify(VIEW_MODE_KEY)}) !== "desktop") return;
    var all = document.querySelectorAll('meta[name="viewport"]');
    for (var i = 1; i < all.length; i++) all[i].remove();
    if (all[0]) all[0].setAttribute("content", ${JSON.stringify(DESKTOP_VIEWPORT)});
  } catch (e) {}
})();
`.trim();

const PRETENDARD_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

/**
 * 웹폰트를 렌더링 차단 없이 불러옵니다.
 * media="print"로 붙이면 화면 렌더링을 막지 않고, 로드가 끝나면 media를 all로 바꿔 적용합니다.
 * CDN이 느리거나 차단된 환경에서도 페이지는 시스템 한글 폰트로 즉시 그려집니다.
 */
export const FONT_LOADER_SCRIPT = `
(function () {
  try {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.media = "print";
    l.href = ${JSON.stringify(PRETENDARD_CSS)};
    l.onload = function () { this.media = "all"; };
    document.head.appendChild(l);
  } catch (e) {}
})();
`.trim();

export function applyViewMode(mode: ViewMode) {
  const meta = viewportMeta();
  if (!meta) return;
  meta.setAttribute("content", mode === "desktop" ? DESKTOP_VIEWPORT : MOBILE_VIEWPORT);
}

/** 실제 스마트폰/태블릿 여부. viewport meta를 바꿔도 값이 흔들리지 않도록 screen 기준으로 판단합니다. */
export function isRealMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const shortSide = Math.min(window.screen.width, window.screen.height);
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return coarse && shortSide <= 820;
}
