"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Staff } from "@/types/staff";
import { User, Users, Clock } from "lucide-react";

interface AssignmentData {
  siteId: string;
  date: string;
  timeSlot: "AM" | "PM";
  staffId: string;
}

interface AvailableStaffListProps {
  staff: Staff[];
  assignments: AssignmentData[];
  onStaffAssign: (
    siteId: string,
    timeSlot: "AM" | "PM",
    staffId: string
  ) => void;
  onStaffUnassign: (siteId: string, timeSlot: "AM" | "PM") => void;
}

export function AvailableStaffList({
  staff,
  assignments,
  onStaffAssign,
  onStaffUnassign,
}: AvailableStaffListProps) {
  const [draggedStaff, setDraggedStaff] = useState<string | null>(null);

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
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "SPOT":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const isStaffAssigned = (staffId: string) => {
    return assignments.some((assignment) => assignment.staffId === staffId);
  };

  const handleDragStart = (e: React.DragEvent, staffId: string) => {
    setDraggedStaff(staffId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", staffId);
  };

  const handleDragEnd = () => {
    setDraggedStaff(null);
  };

  if (staff.length === 0) {
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
            <p className="text-muted-foreground">
              出勤可能なスタッフがいません
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          出勤可能スタッフ ({staff.length}名)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          スタッフをドラッグして現場に配置してください
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {staff.map((member) => {
            const isAssigned = isStaffAssigned(member.id);
            const isDragging = draggedStaff === member.id;

            return (
              <div
                key={member.id}
                draggable={!isAssigned}
                onDragStart={(e) => handleDragStart(e, member.id)}
                onDragEnd={handleDragEnd}
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs transition-all cursor-move
                  ${
                    isAssigned
                      ? "bg-muted/50 border-muted opacity-50 cursor-not-allowed"
                      : "bg-background border-border hover:border-primary/50"
                  }
                  ${isDragging ? "opacity-50" : ""}
                `}
              >
                <span className="font-medium">{member.name}</span>
                <Badge
                  variant="outline"
                  className={`text-xs px-1 py-0 ${getEmploymentTypeColor(
                    member.employmentType
                  )}`}
                >
                  {getEmploymentTypeLabel(member.employmentType)}
                </Badge>
                {isAssigned && (
                  <Clock className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
