"use client";

import { useMemo } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent } from "@/components/ui/card";
import { Site } from "@/types/site";
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
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">現場カレンダー</h3>
          <p className="text-sm text-muted-foreground">
            現場のスケジュールを確認・管理します
          </p>
        </div>
      </div>

      {/* カレンダー */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[900px] [&_.rbc-month-view]:h-full [&_.rbc-date-cell]:min-h-[180px] [&_.rbc-date-cell]:h-auto [&_.rbc-date-cell]:relative [&_.rbc-date-cell]:p-1 [&_.rbc-date-cell]:border [&_.rbc-date-cell]:border-gray-200 [&_.rbc-date-cell]:transition-all [&_.rbc-date-cell]:duration-200 [&_.rbc-date-cell]:ease-in-out [&_.rbc-date-cell:hover]:bg-gray-100 [&_.rbc-date-cell.rbc-today]:bg-gray-50 [&_.rbc-date-cell.rbc-off-range-bg]:bg-gray-50 [&_.rbc-date-cell_.rbc-date-content]:h-full [&_.rbc-date-cell_.rbc-date-content]:flex [&_.rbc-date-cell_.rbc-date-content]:flex-col [&_.rbc-date-cell_.rbc-date-content]:p-0 [&_.rbc-date-cell_.rbc-date-number]:absolute [&_.rbc-date-cell_.rbc-date-number]:top-1 [&_.rbc-date-cell_.rbc-date-number]:left-1 [&_.rbc-date-cell_.rbc-date-number]:z-20 [&_.rbc-date-cell_.rbc-date-number]:font-semibold [&_.rbc-date-cell_.rbc-date-number]:text-sm [&_.rbc-date-cell_.rbc-date-number]:text-gray-700 [&_.rbc-date-cell.rbc-today_.rbc-date-number]:bg-blue-500 [&_.rbc-date-cell.rbc-today_.rbc-date-number]:text-white [&_.rbc-date-cell.rbc-today_.rbc-date-number]:rounded-full [&_.rbc-date-cell.rbc-today_.rbc-date-number]:w-6 [&_.rbc-date-cell.rbc-today_.rbc-date-number]:h-6 [&_.rbc-date-cell.rbc-today_.rbc-date-number]:flex [&_.rbc-date-cell.rbc-today_.rbc-date-number]:items-center [&_.rbc-date-cell.rbc-today_.rbc-date-number]:justify-center [&_.rbc-date-cell.rbc-today_.rbc-date-number]:text-xs [&_.rbc-date-cell:hover_.site-name-item]:bg-green-100 [&_.rbc-date-cell:hover_.site-name-item]:border-green-500 [&_.rbc-date-cell:hover_.site-name-item]:text-green-800 [&_.rbc-date-cell:hover_.site-name-item]:font-medium [&_.rbc-date-cell:hover_.site-name-item]:scale-105">
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
                dateCellWrapper: (props) => (
                  <SiteCalendarDateCell {...props} sites={sites} />
                ),
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

      {/* 凡例 */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        {/* <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>午前</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>午後</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>終日</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>キャンセル</span>
        </div> */}

        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span>日付をクリックして現場を選択</span>
        </div>
      </div>
    </div>
  );
}
