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
      <Card>
        <CardHeader>
          <CardTitle>現場カレンダー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              読み込み中...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>現場カレンダー</CardTitle>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">全日</Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            午前
          </Badge>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            午後
          </Badge>
          <Badge variant="outline" className="bg-red-100 text-red-800">
            中止
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
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
  );
}
