"use client";

import { useState, useEffect } from "react";
import { AssignmentCalendar } from "@/components/assignment/assignment-calendar";
import { AvailableStaffList } from "@/components/assignment/available-staff-list";
import { SiteAssignmentCards } from "@/components/assignment/site-assignment-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Staff, SupportStaff, SupportStaffFormData } from "@/types/staff";
import { Site } from "@/types/site";

interface AssignmentData {
  siteId: string;
  date: string;
  timeSlot: "AM" | "PM";
  staffIds: string[];
}

export default function AssignmentPage() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [supportStaff, setSupportStaff] = useState<SupportStaff[]>([]);
  const [amSites, setAmSites] = useState<Site[]>([]);
  const [pmSites, setPmSites] = useState<Site[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedStaff, setDraggedStaff] = useState<string | null>(null);

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    await fetchAssignmentData(date);
    setActiveTab("assignment");
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
      setSupportStaff(staffResponse.data.supportStaff || []);

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
        const staffId = assignment.staff
          ? assignment.staff.id
          : assignment.staffId;

        if (assignmentMap.has(key)) {
          assignmentMap.get(key)!.staffIds.push(staffId);
        } else {
          assignmentMap.set(key, {
            siteId: assignment.site.id,
            date: assignment.date,
            timeSlot: assignment.timeSlot,
            staffIds: [staffId],
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

  const handleAddSupportStaff = (data: SupportStaffFormData) => {
    // 既存の応援スタッフと重複しないIDを生成
    const existingIds = supportStaff.map((s) => s.id);
    let newId = `support_${Date.now()}`;
    let counter = 1;
    while (existingIds.includes(newId)) {
      newId = `support_${Date.now()}_${counter}`;
      counter++;
    }

    const newSupportStaff: SupportStaff = {
      id: newId,
      companyName: data.companyName,
      count: data.count,
      date: selectedDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSupportStaff((prev) => [...prev, newSupportStaff]);
    toast.success(
      `${data.companyName}の応援スタッフ${data.count}名を追加しました`
    );
  };

  const handleConfirm = async () => {
    try {
      setSaving(true);

      console.log("Confirming assignments:", {
        date: selectedDate,
        assignments: assignments,
        supportStaff: supportStaff,
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

      // 応援スタッフと自社スタッフを分離
      const staffAssignments = assignments.filter((assignment) =>
        assignment.staffIds.some((staffId) => !staffId.startsWith("support_"))
      );

      const supportAssignments = assignments.filter((assignment) =>
        assignment.staffIds.some((staffId) => staffId.startsWith("support_"))
      );

      const response = await axios.post(
        "/api/assignment/confirm",
        {
          date: selectedDate,
          assignments: staffAssignments,
          supportAssignments: supportAssignments,
          supportStaff: supportStaff,
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
        {selectedDate && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {selectedDate}
            </Badge>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">カレンダー</TabsTrigger>
          <TabsTrigger value="assignment">振り分け</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <AssignmentCalendar
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        </TabsContent>

        <TabsContent value="assignment" className="space-y-4">
          {selectedDate ? (
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-250px)] max-lg:h-auto">
              {/* 左側: 出勤可能スタッフ（縦長固定） */}
              <div className="h-full lg:h-full max-lg:h-[400px] overflow-y-auto">
                <AvailableStaffList
                  staff={availableStaff}
                  supportStaff={supportStaff}
                  assignments={assignments}
                  onStaffAssign={handleStaffAssign}
                  onAddSupportStaff={handleAddSupportStaff}
                  draggedStaff={draggedStaff}
                  setDraggedStaff={setDraggedStaff}
                  selectedDate={selectedDate}
                />
              </div>

              {/* 右側: 現場割り当てカード */}
              <div className="flex flex-col h-full max-lg:h-auto overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-2 max-lg:max-h-[600px]">
                  <SiteAssignmentCards
                    amSites={amSites}
                    pmSites={pmSites}
                    assignments={assignments}
                    staff={availableStaff}
                    supportStaff={supportStaff}
                    onStaffAssign={handleStaffAssign}
                    onStaffUnassign={handleStaffUnassign}
                    loading={loading}
                    draggedStaff={draggedStaff}
                    setDraggedStaff={setDraggedStaff}
                  />
                </div>

                {/* 確定ボタン */}
                <div className="flex justify-end pt-4 border-t mt-4">
                  <Button onClick={handleConfirm} disabled={saving} size="lg">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "確定中..." : "人員配置を確定"}
                  </Button>
                </div>
              </div>
            </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
