"use client";

import { useState, useCallback, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon } from "lucide-react";
import axios from "axios";
import { InvoiceCheckCalendarDateCell } from "./invoice-check-calendar-date-cell";

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

interface InvoiceCheckCalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate?: string;
  loading?: boolean;
  onMonthChange?: () => void;
}

export function InvoiceCheckCalendar({
  onDateSelect,
  selectedDate,
  loading = false,
  onMonthChange,
}: InvoiceCheckCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [siteCounts, setSiteCounts] = useState<Record<string, number>>({});
  const [calendarLoading, setCalendarLoading] = useState(false);

  // 月が変更された時に現場件数を一括取得
  useEffect(() => {
    const fetchSiteCounts = async () => {
      try {
        setCalendarLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const response = await axios.get(
          `/api/assignment/site-counts?year=${year}&month=${month}`
        );
        setSiteCounts(response.data.data);
      } catch (error) {
        console.error("Error fetching site counts:", error);
        setSiteCounts({});
      } finally {
        setCalendarLoading(false);
      }
    };

    fetchSiteCounts();
  }, [currentDate]);

  const CustomToolbar = ({ label, onNavigate }: any) => (
    <div className="flex items-center justify-between mb-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onNavigate("PREV")}>
          ← 前月
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("TODAY")}>
          今月
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("NEXT")}>
          次月 →
        </Button>
      </div>
      <h2 className="text-lg font-semibold">{label}</h2>
    </div>
  );

  const handleSelectSlot = useCallback(
    ({ start }: { start: Date }) => {
      const dateStr = moment(start).format("YYYY-MM-DD");
      onDateSelect(dateStr);
    },
    [onDateSelect]
  );

  const CustomDateCellWrapper = useCallback(
    ({ children, value }: any) => {
      const dateStr = moment(value).format("YYYY-MM-DD");
      const siteCount = siteCounts[dateStr] || 0;
      const isSelected = selectedDate === dateStr;

      return (
        <InvoiceCheckCalendarDateCell
          value={value}
          siteCount={siteCount}
          isSelected={isSelected}
        >
          {children}
        </InvoiceCheckCalendarDateCell>
      );
    },
    [siteCounts, selectedDate]
  );

  if (loading || calendarLoading) {
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
          <h3 className="text-lg font-semibold">請求書確認カレンダー</h3>
          <p className="text-sm text-muted-foreground">
            日付を選択して現場の請求書確認を行います
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="h-[400px] [&_.rbc-month-view]:h-full [&_.rbc-date-cell]:min-h-[80px] [&_.rbc-date-cell]:h-auto [&_.rbc-date-cell]:relative [&_.rbc-date-cell]:p-1 [&_.rbc-date-cell]:border [&_.rbc-date-cell]:border-gray-200 [&_.rbc-date-cell]:transition-all [&_.rbc-date-cell]:duration-200 [&_.rbc-date-cell]:ease-in-out [&_.rbc-date-cell:hover]:bg-gray-100 [&_.rbc-date-cell.rbc-today]:bg-gray-50 [&_.rbc-date-cell.rbc-off-range-bg]:bg-gray-50 [&_.rbc-date-cell_.rbc-date-content]:h-full [&_.rbc-date-cell_.rbc-date-content]:flex [&_.rbc-date-cell_.rbc-date-content]:flex-col [&_.rbc-date-cell_.rbc-date-content]:p-0 [&_.rbc-date-cell_.rbc-date-number]:absolute [&_.rbc-date-cell_.rbc-date-number]:top-1 [&_.rbc-date-cell_.rbc-date-number]:left-1 [&_.rbc-date-cell_.rbc-date-number]:z-20 [&_.rbc-date-cell_.rbc-date-number]:font-semibold [&_.rbc-date-cell_.rbc-date-number]:text-sm [&_.rbc-date-cell_.rbc-date-number]:text-gray-700 [&_.rbc-date-cell.rbc-today_.rbc-date-number]:bg-blue-500 [&_.rbc-date-cell.rbc-today_.rbc-date-number]:text-white [&_.rbc-date-cell.rbc-today_.rbc-date-number]:rounded-full [&_.rbc-date-cell.rbc-today_.rbc-date-number]:w-6 [&_.rbc-date-cell.rbc-today_.rbc-date-number]:h-6 [&_.rbc-date-cell.rbc-today_.rbc-date-number]:flex [&_.rbc-date-cell.rbc-today_.rbc-date-number]:items-center [&_.rbc-date-cell.rbc-today_.rbc-date-number]:justify-center [&_.rbc-date-cell.rbc-today_.rbc-date-number]:text-xs">
            <Calendar
              localizer={localizer}
              events={[]}
              startAccessor="start"
              endAccessor="end"
              views={[Views.MONTH]}
              defaultView={Views.MONTH}
              selectable
              onSelectSlot={handleSelectSlot}
              date={currentDate}
              onNavigate={setCurrentDate}
              components={{
                toolbar: CustomToolbar,
                dateCellWrapper: CustomDateCellWrapper,
              }}
              style={{ height: "100%" }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span>日付をクリックして請求書確認を開始</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span>数字はその日の現場件数</span>
        </div>
      </div>
    </div>
  );
}
