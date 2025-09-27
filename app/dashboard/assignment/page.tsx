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
  staffIds: string[];
}

export default function AssignmentPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [amSites, setAmSites] = useState<Site[]>([]);
  const [pmSites, setPmSites] = useState<Site[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedStaff, setDraggedStaff] = useState<string | null>(null);

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

      // 割り当てデータを変換
      const rawAssignments = assignmentsResponse.data.data;
      const groupedAssignments: AssignmentData[] = [];

      // 現場と時間帯ごとにグループ化
      const assignmentMap = new Map<string, AssignmentData>();

      rawAssignments.forEach((assignment: any) => {
        const key = `${assignment.site.id}_${assignment.timeSlot}`;
        if (assignmentMap.has(key)) {
          assignmentMap.get(key)!.staffIds.push(assignment.staff.id);
        } else {
          assignmentMap.set(key, {
            siteId: assignment.site.id,
            date: assignment.date,
            timeSlot: assignment.timeSlot,
            staffIds: [assignment.staff.id],
          });
        }
      });

      setAssignments(Array.from(assignmentMap.values()));
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
    console.log("handleStaffAssign called:", { siteId, timeSlot, staffId });
    setAssignments((prev) => {
      console.log("Current assignments:", prev);
      // 既存の割り当てを探す
      const existingAssignment = prev.find(
        (assignment) =>
          assignment.siteId === siteId && assignment.timeSlot === timeSlot
      );

      if (existingAssignment) {
        // 既存の割り当てにスタッフを追加
        if (
          existingAssignment.staffIds &&
          Array.isArray(existingAssignment.staffIds) &&
          !existingAssignment.staffIds.includes(staffId)
        ) {
          const updated = prev.map((assignment) =>
            assignment.siteId === siteId && assignment.timeSlot === timeSlot
              ? {
                  ...assignment,
                  staffIds: [...(assignment.staffIds || []), staffId],
                }
              : assignment
          );
          return updated;
        }
        return prev;
      } else {
        // 新しい割り当てを作成
        console.log("Creating new assignment:", { siteId, timeSlot, staffId });
        const newAssignments = [
          ...prev,
          { siteId, date: selectedDate, timeSlot, staffIds: [staffId] },
        ];
        console.log("New assignments:", newAssignments);
        return newAssignments;
      }
    });
  };

  const handleStaffUnassign = (
    siteId: string,
    timeSlot: "AM" | "PM",
    staffId: string
  ) => {
    setAssignments((prev) => {
      const assignment = prev.find(
        (assignment) =>
          assignment.siteId === siteId && assignment.timeSlot === timeSlot
      );

      if (
        assignment &&
        assignment.staffIds &&
        Array.isArray(assignment.staffIds)
      ) {
        const updatedStaffIds = assignment.staffIds.filter(
          (id) => id !== staffId
        );

        if (updatedStaffIds.length === 0) {
          // スタッフが0人になったら割り当てを削除
          return prev.filter(
            (assignment) =>
              !(
                assignment.siteId === siteId && assignment.timeSlot === timeSlot
              )
          );
        } else {
          // スタッフを削除して更新
          return prev.map((assignment) =>
            assignment.siteId === siteId && assignment.timeSlot === timeSlot
              ? { ...assignment, staffIds: updatedStaffIds }
              : assignment
          );
        }
      }
      return prev;
    });
  };

  const handleConfirm = async () => {
    try {
      setSaving(true);

      console.log("Confirming assignments:", {
        date: selectedDate,
        assignments: assignments,
      });

      // バリデーション
      if (!selectedDate) {
        toast.error("日付が選択されていません");
        return;
      }

      if (assignments.length === 0) {
        toast.error("割り当てがありません");
        return;
      }

      const response = await axios.post(
        "/api/assignment/confirm",
        {
          date: selectedDate,
          assignments: assignments,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10秒のタイムアウト
        }
      );

      console.log("Assignment confirm response:", response.data);
      toast.success("人員配置を確定しました");
    } catch (error) {
      console.error("Error confirming assignments:", error);

      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });

        if (error.response?.status === 404) {
          toast.error("APIエンドポイントが見つかりません");
        } else if (error.response?.status === 500) {
          const errorMessage =
            error.response?.data?.details ||
            error.response?.data?.error ||
            "サーバーエラーが発生しました";
          toast.error(`サーバーエラー: ${errorMessage}`);
        } else if (error.code === "ECONNABORTED") {
          toast.error("リクエストがタイムアウトしました");
        } else if (error.code === "NETWORK_ERROR") {
          toast.error("ネットワークエラーが発生しました");
        } else {
          toast.error(
            `エラーが発生しました: ${
              error.response?.statusText || error.message
            }`
          );
        }
      } else if (error instanceof Error) {
        toast.error(`エラーが発生しました: ${error.message}`);
      } else {
        toast.error("予期しないエラーが発生しました");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-2">
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
                draggedStaff={draggedStaff}
                setDraggedStaff={setDraggedStaff}
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
                draggedStaff={draggedStaff}
                setDraggedStaff={setDraggedStaff}
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
