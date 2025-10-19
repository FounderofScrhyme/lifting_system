import { ReactNode, useState, useRef, useEffect } from "react";
import moment from "moment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, MapPin, Clock, User } from "lucide-react";

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
  const [showModal, setShowModal] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  const dateString = moment(value).format("YYYY-MM-DD");
  const daySites = sites.filter(
    (site) => moment(site.date).format("YYYY-MM-DD") === dateString
  );

  const handleMouseEnter = () => {
    if (daySites.length > 4) {
      const timeout = setTimeout(() => {
        setShowModal(true);
      }, 1000);
      setHoverTimeout(timeout);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleSiteClick = (site: any, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    // モーダルを閉じてから遷移
    closeModal();
    // 少し遅延させてから遷移（モーダルが閉じるのを待つ）
    setTimeout(() => {
      window.location.href = `/dashboard/site/${site.id}`;
    }, 100);
  };

  const handleModalClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handleCellClick = (event: React.MouseEvent) => {
    // モーダル表示中はセルのクリックイベントを無効化
    if (showModal) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <>
      <div
        ref={cellRef}
        className={`relative w-full h-full group ${
          showModal ? "pointer-events-none" : ""
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCellClick}
      >
        {children}
        {daySites.length > 0 && (
          <div className="absolute inset-0 pt-8 px-1 z-10">
            <div className="h-full overflow-hidden">
              <div className="space-y-1">
                {daySites.slice(0, 4).map((site, index) => (
                  <div
                    key={index}
                    className="site-name-item text-xs bg-green-100 text-green-700 px-2 py-1 rounded border border-green-300 transition-all duration-200 ease-in-out cursor-pointer hover:bg-green-200 hover:scale-105 relative z-20"
                    title={`${site.name} - ${
                      site.client?.name || "工務店不明"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-medium truncate">{site.name}</span>
                      <span className="text-xs text-green-600 truncate">
                        ({site.client?.name || "工務店不明"})
                      </span>
                    </div>
                  </div>
                ))}
                {daySites.length > 4 && (
                  <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded text-center border border-blue-300 relative z-20">
                    +{daySites.length - 4}件
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="pointer-events-auto" onClick={handleModalClick}>
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl border-2 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50">
                <CardTitle className="text-lg font-semibold text-blue-900">
                  {moment(value).format("YYYY年MM月DD日")}の現場一覧
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[60vh] bg-white">
                <div className="space-y-3">
                  {daySites.map((site, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={(event) => handleSiteClick(site, event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-lg">
                              {site.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {site.client?.name || "工務店不明"}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>開始時間: {site.startTime}</span>
                            </div>
                            {site.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{site.address}</span>
                              </div>
                            )}
                            {site.workContent && (
                              <div className="text-sm">
                                <span className="font-medium">作業内容: </span>
                                <span>{site.workContent}</span>
                              </div>
                            )}
                            {site.notes && (
                              <div className="text-sm">
                                <span className="font-medium">備考: </span>
                                <span>{site.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {site.cancelled && (
                          <Badge variant="destructive" className="ml-2">
                            キャンセル
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
