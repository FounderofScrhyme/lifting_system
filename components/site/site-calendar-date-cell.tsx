import { ReactNode } from "react";
import moment from "moment";

interface SiteCalendarDateCellProps {
  children: ReactNode;
  value: Date;
  sites?: any[];
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
    <div className="relative w-full h-full group">
      {children}
      {daySites.length > 0 && (
        <div className="absolute inset-0 pt-8 px-1">
          <div className="h-full overflow-hidden">
            {daySites.length <= 4 ? (
              <div className="space-y-1">
                {daySites.map((site, index) => (
                  <div
                    key={index}
                    className="site-name-item text-xs bg-green-100 text-green-700 px-2 py-1 rounded border border-green-300 truncate transition-all duration-200 ease-in-out cursor-pointer hover:bg-green-100 hover:scale-105 hover:z-10 relative"
                    title={site.name}
                  >
                    {site.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {daySites.slice(0, 8).map((site, index) => (
                  <div
                    key={index}
                    className="site-name-item text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded border  truncate transition-all duration-200 ease-in-out cursor-pointer hover:bg-green-100 hover:scale-105 hover:z-10 relative"
                    title={site.name}
                  >
                    {site.name}
                  </div>
                ))}
                {daySites.length > 8 && (
                  <div className="col-span-2 text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded text-center">
                    +{daySites.length - 8}件
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
