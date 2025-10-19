"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Staff, SupportStaff, SupportStaffFormData } from "@/types/staff";
import { User, Users, Clock, Building2 } from "lucide-react";
import { SupportStaffModal } from "./support-staff-modal";

interface AssignmentData {
  siteId: string;
  date: string;
  timeSlot: "AM" | "PM";
  staffIds: string[];
}

interface AvailableStaffListProps {
  staff: Staff[];
  supportStaff: SupportStaff[];
  assignments: AssignmentData[];
  onStaffAssign: (
    siteId: string,
    timeSlot: "AM" | "PM",
    staffId: string
  ) => void;
  onAddSupportStaff: (data: SupportStaffFormData) => void;
  draggedStaff: string | null;
  setDraggedStaff: (staffId: string | null) => void;
  selectedDate: string;
}

export function AvailableStaffList({
  staff,
  supportStaff,
  assignments,
  onStaffAssign,
  onAddSupportStaff,
  draggedStaff,
  setDraggedStaff,
  selectedDate,
}: AvailableStaffListProps) {
  const getEmploymentTypeLabel = (type: string) => {
    switch (type) {
      case "REGULAR":
        return "レギュラー";
      case "SPOT":
        return "スポット";
      default:
        return type;
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case "REGULAR":
        return "bg-blue-100 text-blue-800";
      case "SPOT":
        return "bg-green-100 text-green-800";
      case "SUPPORT":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isStaffAssigned = (staffId: string) => {
    // スタッフが既に割り当てられているかどうかをチェック
    // ただし、複数の現場に配置することは許可する
    return assignments.some(
      (assignment) =>
        assignment.staffIds &&
        Array.isArray(assignment.staffIds) &&
        assignment.staffIds.includes(staffId)
    );
  };

  const handleDragStart = (e: React.DragEvent, staffId: string) => {
    console.log("Drag start:", staffId);
    setDraggedStaff(staffId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", staffId);
  };

  const handleDragEnd = () => {
    setDraggedStaff(null);
  };

  // 応援スタッフの表示用データを生成
  const supportStaffItems = supportStaff.map((support) => ({
    id: support.id,
    name: `${support.companyName} (${support.count}名)`,
    employmentType: "SUPPORT" as const,
    isSupport: true,
  }));

  const allStaff = [...staff, ...supportStaffItems];

  if (allStaff.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            出勤可能スタッフ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              出勤可能なスタッフがいません
            </p>
            <SupportStaffModal
              onAddSupportStaff={onAddSupportStaff}
              selectedDate={selectedDate}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            出勤可能スタッフ ({allStaff.length}名)
          </CardTitle>
          <SupportStaffModal
            onAddSupportStaff={onAddSupportStaff}
            selectedDate={selectedDate}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          スタッフをドラッグして現場に配置してください
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {allStaff.map((member) => {
            const isAssigned = isStaffAssigned(member.id);
            const isDragging = draggedStaff === member.id;

            return (
              <div
                key={member.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, member.id)}
                onDragEnd={handleDragEnd}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs transition-all cursor-move
                  ${
                    isAssigned
                      ? "bg-blue-50 border-blue-200 hover:border-blue-300"
                      : "bg-background border-border hover:border-primary/50"
                  }
                  ${isDragging ? "opacity-50 scale-95" : "hover:scale-105"}
                `}
              >
                <span className="font-medium">{member.name}</span>
                <Badge
                  variant="outline"
                  className={`text-xs px-1 py-0 ${getEmploymentTypeColor(
                    member.employmentType
                  )}`}
                >
                  {member.employmentType === "SUPPORT"
                    ? "応援"
                    : getEmploymentTypeLabel(member.employmentType)}
                </Badge>
                {isAssigned && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    配置済み
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
