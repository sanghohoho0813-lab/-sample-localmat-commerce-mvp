import { MapPinOff } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function NotFound() {
  return (
    <div className="container-page">
      <EmptyState
        as="h1"
        icon={MapPinOff}
        title="페이지를 찾을 수 없어요"
        description="주소가 바뀌었거나 없는 페이지예요."
        action={{ label: "홈으로 가기", href: "/" }}
        className="py-20 md:py-24"
      />
    </div>
  );
}
