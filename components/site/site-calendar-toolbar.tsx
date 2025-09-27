import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface SiteCalendarToolbarProps {
  label: string;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
  onMonthChange?: () => void;
}

export function SiteCalendarToolbar({
  label,
  onNavigate,
  onMonthChange,
}: SiteCalendarToolbarProps) {
  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    onNavigate(action);
    onMonthChange?.();
  };

  return (
    <div className="flex items-center justify-between mb-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigate("PREV")}
        >
          ← 前月
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigate("TODAY")}
        >
          今月
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigate("NEXT")}
        >
          次月 →
        </Button>
      </div>
      <h2 className="text-lg font-semibold">{label}</h2>
      <div className="flex items-center gap-2">
        <Badge variant="default">現場管理モード</Badge>
      </div>
    </div>
  );
}
