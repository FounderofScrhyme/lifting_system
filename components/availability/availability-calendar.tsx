"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Staff } from "@/types/staff";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
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

interface AvailabilityCalendarProps {
  staff: Staff;
  onBack: () => void;
}

interface AvailabilityEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "AVAILABLE_FULL" | "HOLIDAY_FULL";
}

export function AvailabilityCalendar({
  staff,
  onBack,
}: AvailabilityCalendarProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const isRegular = staff.employmentType === "REGULAR";
  const titleText = isRegular ? "休日設定" : "出勤可能日設定";
  const descriptionText = isRegular
    ? "休日として設定する日付を選択してください"
    : "出勤可能日として設定する日付を選択してください";

  useEffect(() => {
    fetchAvailability();
  }, [staff.id]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/availability?staffId=${staff.id}`);
      const dates = response.data.data.map((item: any) => new Date(item.date));
      setSelectedDates(dates);
    } catch (error) {
      console.error("Error fetching availability:", error);
      // エラーが発生しても空の配列で初期化
      setSelectedDates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    const dateStr = moment(start).format("YYYY-MM-DD");
    const date = new Date(dateStr);

    setSelectedDates((prev) => {
      const isSelected = prev.some(
        (d) => moment(d).format("YYYY-MM-DD") === dateStr
      );

      if (isSelected) {
        // 既に選択されている場合は削除
        return prev.filter((d) => moment(d).format("YYYY-MM-DD") !== dateStr);
      } else {
        // 選択されていない場合は追加
        return [...prev, date];
      }
    });
  }, []);

  const handleDoubleClickEvent = useCallback((event: AvailabilityEvent) => {
    const dateStr = moment(event.start).format("YYYY-MM-DD");

    setSelectedDates((prev) => {
      return prev.filter((d) => moment(d).format("YYYY-MM-DD") !== dateStr);
    });
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      const availabilityData = selectedDates.map((date) => ({
        staffId: staff.id,
        date: moment(date).format("YYYY-MM-DD"),
        type: isRegular ? "HOLIDAY_FULL" : "AVAILABLE_FULL",
      }));

      await axios.post("/api/availability", {
        staffId: staff.id,
        availability: availabilityData,
      });

      toast.success(`${titleText}を保存しました`);
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error(`${titleText}の保存に失敗しました`);
    } finally {
      setSaving(false);
    }
  };

  const events: AvailabilityEvent[] = useMemo(() => {
    return selectedDates.map((date, index) => ({
      id: `availability-${index}`,
      title: isRegular ? "休日" : "出勤可能",
      start: moment(date).startOf("day").toDate(),
      end: moment(date).endOf("day").toDate(),
      type: isRegular ? "HOLIDAY_FULL" : "AVAILABLE_FULL",
    }));
  }, [selectedDates, isRegular]);

  const eventStyleGetter = (event: AvailabilityEvent) => {
    const baseStyle = {
      borderRadius: "4px",
      border: "none",
      color: "white",
      padding: "2px 4px",
      fontSize: "12px",
    };

    if (event.type === "AVAILABLE_FULL") {
      return {
        style: {
          ...baseStyle,
          backgroundColor: "#10b981", // green-500
        },
      };
    } else {
      return {
        style: {
          ...baseStyle,
          backgroundColor: "#ef4444", // red-500
        },
      };
    }
  };

  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
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
      <div className="hidden md:flex items-center gap-2">
        <Badge variant={isRegular ? "destructive" : "default"}>
          {isRegular ? "休日設定モード" : "出勤可能日設定モード"}
        </Badge>
      </div>
    </div>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{titleText}</h3>
          <p className="text-sm text-muted-foreground">{descriptionText}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            スタッフ一覧に戻る
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "保存中..." : "保存"}
          </Button>
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
              views={[Views.MONTH]}
              defaultView={Views.MONTH}
              selectable
              onSelectSlot={handleSelectSlot}
              onDoubleClickEvent={handleDoubleClickEvent}
              eventPropGetter={eventStyleGetter}
              date={currentDate}
              onNavigate={setCurrentDate}
              components={{
                toolbar: CustomToolbar,
              }}
              style={{ height: "100%" }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex-col md:flex-row items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>{isRegular ? "休日" : "出勤可能日"}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span>
            日付をクリックして{isRegular ? "休日" : "出勤可能日"}を設定・解除
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">
            設定済みの日付をダブルクリックで取り消し
          </span>
        </div>
      </div>
    </div>
  );
}
