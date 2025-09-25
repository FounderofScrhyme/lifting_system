import { Button } from "@/components/ui/button";
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
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold">{label}</h2>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigate("PREV")}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          前月
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigate("TODAY")}
          className="flex items-center gap-1"
        >
          <Calendar className="h-4 w-4" />
          今日
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigate("NEXT")}
          className="flex items-center gap-1"
        >
          次月
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
