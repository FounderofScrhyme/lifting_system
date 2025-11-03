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
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            出勤可能スタッフ
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4 text-sm">
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
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            出勤可能スタッフ
          </CardTitle>
          <SupportStaffModal
            onAddSupportStaff={onAddSupportStaff}
            selectedDate={selectedDate}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">
            ドラッグして現場に配置
          </p>
          <Badge variant="secondary" className="text-xs">
            {allStaff.length}名
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
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
                  flex items-center p-2.5 rounded-lg border transition-all cursor-move
                  ${
                    isAssigned
                      ? "bg-blue-50 border-blue-200 hover:border-blue-300"
                      : "bg-background border-border hover:border-primary/50"
                  }
                  ${isDragging ? "opacity-50 scale-95" : "hover:scale-[1.02]"}
                `}
              >
                <span className="font-medium text-sm truncate flex-1">
                  {member.name}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
