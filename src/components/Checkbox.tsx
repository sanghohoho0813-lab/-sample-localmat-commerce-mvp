"use client";

import { Check } from "lucide-react";

/**
 * 둥근 체크 — 장바구니 선택처럼 '고름/뺌'을 나타냅니다.
 * 실제 <input type="checkbox">를 그대로 써서 키보드·스크린리더 동작은 브라우저 기본을 따르고,
 * 눈에 보이는 원만 새로 그립니다.
 */
export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  children,
  className = "",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** 글자 없이 원만 둘 때의 접근성 이름 */
  label?: string;
  disabled?: boolean;
  /** 옆에 붙는 글자 — 함께 눌러도 체크됩니다 */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`inline-flex items-center gap-1 tap-highlight-none ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      {/* 투명한 실제 체크박스가 원 둘레의 누르는 영역(36×44px)을 덮습니다 */}
      <span className="relative flex h-11 w-9 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          checked={checked}
          disabled={disabled}
          aria-label={children ? undefined : label}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          aria-hidden
          className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-bark-300 bg-white text-white transition-colors duration-150 peer-checked:border-leaf-700 peer-checked:bg-leaf-700 peer-focus-visible:ring-2 peer-focus-visible:ring-leaf-500 peer-focus-visible:ring-offset-2 peer-disabled:border-bark-200 peer-disabled:bg-bark-100 [&>svg]:scale-50 [&>svg]:opacity-0 [&>svg]:transition-all peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3.2} />
        </span>
      </span>
      {children}
    </label>
  );
}
