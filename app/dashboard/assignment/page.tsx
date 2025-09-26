"use client";

import { useState, useEffect } from "react";
import { AssignmentCalendar } from "@/components/assignment/assignment-calendar";
import { AvailableStaffList } from "@/components/assignment/available-staff-list";
import { SiteAssignmentCards } from "@/components/assignment/site-assignment-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Staff } from "@/types/staff";
import { Site } from "@/types/site";

interface AssignmentData {
  siteId: string;
  date: string;
  timeSlot: "AM" | "PM";
  staffId: string;
}

export default function AssignmentPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [amSites, setAmSites] = useState<Site[]>([]);
  const [pmSites, setPmSites] = useState<Site[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    await fetchAssignmentData(date);
  };

  const fetchAssignmentData = async (date: string) => {
    try {
      setLoading(true);

      // 並列でデータを取得
      const [staffResponse, sitesResponse, assignmentsResponse] =
        await Promise.all([
          axios.get(`/api/assignment/available-staff?date=${date}`),
          axios.get(`/api/assignment/sites?date=${date}`),
          axios.get(`/api/assignment/assignments?date=${date}`),
        ]);

      setAvailableStaff(staffResponse.data.data);

      const sites = sitesResponse.data.data;
      // 午前・午後に分ける
      const am = sites.filter(
        (site: Site) => site.siteType === "AM" || site.siteType === "FULL"
      );
      const pm = sites.filter(
        (site: Site) => site.siteType === "PM" || site.siteType === "FULL"
      );

      setAmSites(am);
      setPmSites(pm);
      setAssignments(assignmentsResponse.data.data);
    } catch (error) {
      console.error("Error fetching assignment data:", error);
      toast.error("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleStaffAssign = (
    siteId: string,
    timeSlot: "AM" | "PM",
    staffId: string
  ) => {
    setAssignments((prev) => {
      // 既存の割り当てを削除
      const filtered = prev.filter(
        (assignment) =>
          !(assignment.siteId === siteId && assignment.timeSlot === timeSlot)
      );

      // 新しい割り当てを追加
      return [...filtered, { siteId, date: selectedDate, timeSlot, staffId }];
    });
  };

  const handleStaffUnassign = (siteId: string, timeSlot: "AM" | "PM") => {
    setAssignments((prev) =>
      prev.filter(
        (assignment) =>
          !(assignment.siteId === siteId && assignment.timeSlot === timeSlot)
      )
    );
  };

  const handleConfirm = async () => {
    try {
      setSaving(true);

      await axios.post("/api/assignment/confirm", {
        date: selectedDate,
        assignments: assignments,
      });

      toast.success("人員配置を確定しました");
    } catch (error) {
      console.error("Error confirming assignments:", error);
      toast.error("人員配置の確定に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">振り分け管理</h1>
          <p className="text-muted-foreground">
            スタッフの現場への振り分けを行います
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <CalendarIcon className="h-3 w-3 mr-1" />
            日付選択
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* カレンダー */}
        <div className="lg:col-span-1">
          <AssignmentCalendar
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        </div>

        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-4">
          {selectedDate ? (
            <>
              {/* 出勤可能スタッフ */}
              <AvailableStaffList
                staff={availableStaff}
                assignments={assignments}
                onStaffAssign={handleStaffAssign}
                onStaffUnassign={handleStaffUnassign}
              />

              {/* 現場割り当てカード */}
              <SiteAssignmentCards
                amSites={amSites}
                pmSites={pmSites}
                assignments={assignments}
                staff={availableStaff}
                onStaffAssign={handleStaffAssign}
                onStaffUnassign={handleStaffUnassign}
                loading={loading}
              />

              {/* 確定ボタン */}
              <div className="flex justify-end">
                <Button onClick={handleConfirm} disabled={saving} size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "確定中..." : "人員配置を確定"}
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    カレンダーから日付を選択してください
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
