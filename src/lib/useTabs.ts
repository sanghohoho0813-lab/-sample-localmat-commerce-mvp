"use client";

import { useCallback, useId, useRef } from "react";

/**
 * WAI-ARIA 탭 패턴 — ←/→·Home/End로 탭을 옮기고(옮기면 바로 선택), Tab 키로는 선택된 탭 하나만 지나갑니다.
 * 각 탭 버튼에 `tabProps(id)`, 내용 영역에 `panelProps(id)`를 펼쳐 쓰면 aria 연결까지 맞춰집니다.
 */
export function useTabs<T extends string>(ids: readonly T[], selected: T, onSelect: (id: T) => void) {
  const base = useId();
  const refs = useRef(new Map<T, HTMLButtonElement>());

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const index = ids.indexOf(selected);
      const next =
        event.key === "ArrowRight"
          ? ids[(index + 1) % ids.length]
          : event.key === "ArrowLeft"
            ? ids[(index - 1 + ids.length) % ids.length]
            : event.key === "Home"
              ? ids[0]
              : event.key === "End"
                ? ids[ids.length - 1]
                : undefined;
      if (!next) return;
      event.preventDefault();
      onSelect(next);
      refs.current.get(next)?.focus();
    },
    [ids, selected, onSelect]
  );

  const tabProps = (id: T) => ({
    id: `${base}-tab-${id}`,
    role: "tab" as const,
    type: "button" as const,
    "aria-selected": id === selected,
    "aria-controls": `${base}-panel`,
    tabIndex: id === selected ? 0 : -1,
    ref: (el: HTMLButtonElement | null) => {
      if (el) refs.current.set(id, el);
      else refs.current.delete(id);
    },
    onClick: () => onSelect(id),
  });

  const panelProps = {
    id: `${base}-panel`,
    role: "tabpanel" as const,
    "aria-labelledby": `${base}-tab-${selected}`,
  };

  return { tabListProps: { role: "tablist" as const, onKeyDown }, tabProps, panelProps };
}
