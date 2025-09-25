import { SiteCalendarEvent } from "@/types/site";
import { Badge } from "@/components/ui/badge";

interface SiteCalendarEventComponentProps {
  event: SiteCalendarEvent;
}

export function SiteCalendarEventComponent({
  event,
}: SiteCalendarEventComponentProps) {
  const site = event.resource;

  const getEventVariant = () => {
    if (site.cancelled) return "destructive";
    if (site.siteType === "AM") return "default";
    if (site.siteType === "PM") return "secondary";
    return "outline";
  };

  return (
    <div className="p-1">
      <div className="flex items-center gap-1 text-xs">
        <Badge variant={getEventVariant()} className="text-xs px-1 py-0">
          {site.name}
        </Badge>
      </div>
    </div>
  );
}
