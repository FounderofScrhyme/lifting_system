"use client";

import { useMemo } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Site, SiteCalendarEvent } from "@/types/site";
import { useSiteCalendar } from "@/hooks/use-site-calendar";
import { SiteCalendarToolbar } from "./site-calendar-toolbar";
import { SiteCalendarEventComponent } from "./site-calendar-event";
import { SiteCalendarDateCell } from "./site-calendar-date-cell";
import { Calendar as CalendarIcon } from "lucide-react";

// moment.jsの日本語ロケール設定
moment.locale("ja", {
  months: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
  weekdays: [
    "日曜日",
    "月曜日",
    "火曜日",
    "水曜日",
    "木曜日",
    "金曜日",
    "土曜日",
  ],
  weekdaysShort: ["日", "月", "火", "水", "木", "金", "土"],
  weekdaysMin: ["日", "月", "火", "水", "木", "金", "土"],
});

const localizer = momentLocalizer(moment);

interface SiteCalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate?: string;
  sites: Site[];
  loading?: boolean;
  onMonthChange?: () => void;
}

export function SiteCalendar({
  onDateSelect,
  selectedDate,
  sites,
  loading = false,
  onMonthChange,
}: SiteCalendarProps) {
  const {
    currentDate,
    setCurrentDate,
    events,
    handleNavigate,
    handleSelectSlot,
    handleSelectEvent,
    getEventStyle,
    getDateCellStyle,
  } = useSiteCalendar({ sites, onDateSelect });

  const eventStyleGetter = useMemo(() => getEventStyle, [getEventStyle]);
  const dateCellStyleGetter = useMemo(
    () => getDateCellStyle,
    [getDateCellStyle]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">現場カレンダー</h3>
          <p className="text-sm text-muted-foreground">
            現場のスケジュールを確認・管理します
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              views={[Views.MONTH]}
              defaultView={Views.MONTH}
              date={currentDate}
              onNavigate={setCurrentDate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              eventPropGetter={eventStyleGetter}
              dayPropGetter={dateCellStyleGetter}
              components={{
                toolbar: (props) => (
                  <SiteCalendarToolbar
                    {...props}
                    onNavigate={handleNavigate}
                    onMonthChange={onMonthChange}
                  />
                ),
                event: SiteCalendarEventComponent,
                dateCellWrapper: SiteCalendarDateCell,
              }}
              messages={{
                today: "今日",
                previous: "前月",
                next: "次月",
                month: "月",
                week: "週",
                day: "日",
                agenda: "予定",
                date: "日付",
                time: "時間",
                event: "現場",
                noEventsInRange: "この期間に現場はありません",
                showMore: (total) => `+${total}件表示`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>全日</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>午前</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>午後</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>中止</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span>日付をクリックして現場を選択</span>
        </div>
      </div>
    </div>
  );
}
