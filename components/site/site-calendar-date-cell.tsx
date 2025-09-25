import { ReactNode } from "react";
import moment from "moment";

interface SiteCalendarDateCellProps {
  children: ReactNode;
  value: Date;
  sites?: any[]; // この日付の現場データ
}

export function SiteCalendarDateCell({
  children,
  value,
  sites = [],
}: SiteCalendarDateCellProps) {
  const dateString = moment(value).format("YYYY-MM-DD");
  const daySites = sites.filter(
    (site) => moment(site.date).format("YYYY-MM-DD") === dateString
  );

  return (
    <div className="relative">
      {children}
      {daySites.length > 0 && (
        <div className="absolute top-1 right-1 z-10">
          <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm">
            {daySites.length}
          </div>
        </div>
      )}
    </div>
  );
}
