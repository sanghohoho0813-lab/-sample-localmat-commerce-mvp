"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Star, X } from "lucide-react";
import type { Product } from "@/lib/types";
import ProductImage from "@/components/ProductImage";

const MIN_LENGTH = 10;
const MAX_LENGTH = 300;
const RATING_WORDS = ["", "별로예요", "그저 그래요", "괜찮아요", "좋아요", "최고예요"];

/**
 * 리뷰 작성 창 — 별점과 한 줄 이상의 후기만 받습니다.
 * 네이티브 <dialog>.showModal()로 브라우저 최상위 레이어에 띄웁니다.
 * (공용 뒤로·앞으로 버튼이 최대 z-index로 떠 있어 일반 오버레이로는 등록 버튼을 가립니다.
 *  ESC 닫기·포커스 가두기도 브라우저가 처리합니다.)
 */
export default function ReviewModal({
  product,
  onClose,
  onSubmit,
}: {
  product: Product;
  onClose: () => void;
  onSubmit: (input: { rating: number; content: string }) => void;
}) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const titleId = useId();
  const firstStarRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const ratingError = submitted && rating === 0;
  const contentError = submitted && content.trim().length < MIN_LENGTH;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    firstStarRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      if (dialog?.open) dialog.close();
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (rating === 0 || content.trim().length < MIN_LENGTH) return;
    onSubmit({ rating, content: content.trim() });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // ESC → 브라우저 기본 닫기 대신 부모 상태로 닫습니다.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // 바깥(어두운 영역) 클릭으로 닫기 — dialog 자체가 클릭 대상일 때만
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-0 h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-4 backdrop:bg-bark-900/50 open:flex"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative flex max-h-full w-full max-w-md flex-col overflow-y-auto rounded-3xl bg-white p-5 shadow-lift animate-fade-up md:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-extrabold text-bark-900">
            리뷰 쓰기
          </h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-bark-500 hover:bg-cream-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-cream-50 p-3">
          <ProductImage product={product} className="w-14 rounded-xl" iconSize="text-xl" sizes="56px" />
          <p className="line-clamp-2 min-w-0 text-[16px] font-semibold text-bark-800">
            {product.name} {product.unit}
          </p>
        </div>

        <fieldset className="mt-5">
          <legend className="text-[16px] font-bold text-bark-800">상품은 어떠셨나요?</legend>
          <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="별점">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                ref={n === 1 ? firstStarRef : undefined}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`별점 ${n}점`}
                onClick={() => setRating(n)}
                className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform active:scale-90 focus-ring"
              >
                <Star
                  className={`h-9 w-9 ${n <= rating ? "fill-tangerine-400 text-tangerine-400" : "text-bark-200"}`}
                  strokeWidth={1.6}
                />
              </button>
            ))}
            <span className="ml-2 text-[16px] font-semibold text-bark-600" aria-live="polite">
              {RATING_WORDS[rating]}
            </span>
          </div>
          {ratingError && (
            <p role="alert" className="mt-1.5 text-sm font-medium text-red-600">
              별점을 골라 주세요.
            </p>
          )}
        </fieldset>

        <div className="mt-5">
          <label htmlFor={`${titleId}-content`} className="text-[16px] font-bold text-bark-800">
            후기
          </label>
          <textarea
            id={`${titleId}-content`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_LENGTH}
            rows={4}
            placeholder="맛, 신선도, 포장 상태 등을 알려 주세요."
            aria-invalid={contentError}
            className={`mt-1.5 w-full resize-none rounded-xl border bg-white p-3.5 text-[16px] leading-relaxed outline-none ${
              contentError ? "border-red-400 focus:border-red-500" : "border-bark-200 focus:border-leaf-400"
            }`}
          />
          <div className="mt-1 flex items-start justify-between gap-3 text-sm">
            <p className={contentError ? "font-medium text-red-600" : "text-bark-400"} role={contentError ? "alert" : undefined}>
              {contentError ? `${MIN_LENGTH}자 이상 적어 주세요.` : `${MIN_LENGTH}자 이상`}
            </p>
            <span className="shrink-0 tabular-nums text-bark-400">
              {content.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>

        <button type="submit" className="btn-primary mt-5 h-13 w-full shrink-0 text-[18px]">
          리뷰 등록
        </button>
      </form>
    </dialog>
  );
}
