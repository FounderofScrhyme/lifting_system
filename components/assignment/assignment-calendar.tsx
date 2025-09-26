"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon } from "lucide-react";
import { AssignmentCalendarDateCell } from "./assignment-calendar-date-cell";
import axios from "axios";

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

interface AssignmentCalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

export function AssignmentCalendar({
  onDateSelect,
  selectedDate,
}: AssignmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [siteCounts, setSiteCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // 月が変更された時に現場件数を一括取得
  useEffect(() => {
    const fetchSiteCounts = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
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
        <Button variant="outline" size="sm" onClick={() => onNavigate("NEXT")}>
          次月 →
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("TODAY")}>
          今日
        </Button>
      </div>
      <h2 className="text-lg font-semibold">{label}</h2>
      <div className="flex items-center gap-2">
        <Badge variant="default">振り分け管理モード</Badge>
      </div>
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
        <AssignmentCalendarDateCell
          value={value}
          siteCount={siteCount}
          isSelected={isSelected}
        >
          {children}
        </AssignmentCalendarDateCell>
      );
    },
    [siteCounts, selectedDate]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">日付選択</h3>
          <p className="text-sm text-muted-foreground">
            振り分けを行う日付を選択してください
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="h-[400px]">
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
          <span>日付をクリックして振り分けを開始</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span>数字はその日の現場件数</span>
        </div>
      </div>
    </div>
  );
}
