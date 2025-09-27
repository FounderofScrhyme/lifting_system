"use client";

import { useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Site } from "@/types/site";
import { Staff } from "@/types/staff";
import { MapPin, Clock, Users, X, User } from "lucide-react";

interface AssignmentData {
  siteId: string;
  date: string;
  timeSlot: "AM" | "PM";
  staffIds: string[];
}

interface SiteAssignmentCardsProps {
  amSites: Site[];
  pmSites: Site[];
  assignments: AssignmentData[];
  staff: Staff[];
  onStaffAssign: (
    siteId: string,
    timeSlot: "AM" | "PM",
    staffId: string
  ) => void;
  onStaffUnassign: (
    siteId: string,
    timeSlot: "AM" | "PM",
    staffId: string
  ) => void;
  loading?: boolean;
  draggedStaff: string | null;
  setDraggedStaff: (staffId: string | null) => void;
}

export const SiteAssignmentCards = memo(function SiteAssignmentCards({
  amSites,
  pmSites,
  assignments,
  staff,
  onStaffAssign,
  onStaffUnassign,
  loading = false,
  draggedStaff,
  setDraggedStaff,
}: SiteAssignmentCardsProps) {
  const getSiteTypeLabel = (type: string) => {
    switch (type) {
      case "FULL":
        return "終日";
      case "AM":
        return "午前";
      case "PM":
        return "午後";
      default:
        return type;
    }
  };

  const getSiteTypeColor = (type: string) => {
    switch (type) {
      case "FULL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "AM":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "PM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getAssignedStaff = (siteId: string, timeSlot: "AM" | "PM") => {
    return assignments.find(
      (assignment) =>
        assignment.siteId === siteId && assignment.timeSlot === timeSlot
    );
  };

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find((s) => s.id === staffId);
    return staffMember ? staffMember.name : `スタッフ${staffId.slice(-4)}`;
  };

  const isStaffAssigned = (
    siteId: string,
    timeSlot: "AM" | "PM",
    staffId: string
  ) => {
    const assignment = getAssignedStaff(siteId, timeSlot);
    return assignment &&
      assignment.staffIds &&
      Array.isArray(assignment.staffIds)
      ? assignment.staffIds.includes(staffId)
      : false;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent,
    siteId: string,
    timeSlot: "AM" | "PM"
  ) => {
    e.preventDefault();
    const staffId = e.dataTransfer.getData("text/plain");
    console.log("Drop event:", { staffId, siteId, timeSlot, draggedStaff });

    if (staffId && !isStaffAssigned(siteId, timeSlot, staffId)) {
      console.log("Assigning staff:", { siteId, timeSlot, staffId });
      onStaffAssign(siteId, timeSlot, staffId);
    }
    setDraggedStaff(null);
  };

  const SiteCard = ({
    site,
    timeSlot,
  }: {
    site: Site;
    timeSlot: "AM" | "PM";
  }) => {
    const assignedStaff = getAssignedStaff(site.id, timeSlot);
    const isFullDay = site.siteType === "FULL";
    const showTimeSlot = isFullDay || site.siteType === timeSlot;

    if (!showTimeSlot) return null;

    return (
      <div
        className="p-3 border rounded-lg bg-background hover:border-primary/50 transition-colors"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, site.id, timeSlot)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-medium text-sm truncate">{site.name}</span>
            <Badge className={`text-xs ${getSiteTypeColor(site.siteType)}`}>
              {getSiteTypeLabel(site.siteType)}
            </Badge>
          </div>
        </div>

        <div
          className="min-h-[40px] p-2 border-2 border-dashed border-muted rounded-md transition-colors hover:border-primary/50"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, site.id, timeSlot)}
        >
          {assignedStaff &&
          assignedStaff.staffIds &&
          Array.isArray(assignedStaff.staffIds) &&
          assignedStaff.staffIds.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {assignedStaff.staffIds.map((staffId) => (
                <div
                  key={staffId}
                  className="flex items-center justify-between"
                  onDragOver={(e) => e.stopPropagation()}
                  onDrop={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-md gap-1 flex-1 min-w-0">
                    <User className="h-3 w-3 text-primary flex-shrink-0" />
                    <span className="text-xs font-medium text-primary truncate">
                      {getStaffName(staffId)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStaffUnassign(site.id, timeSlot, staffId)}
                    className="h-5 w-5 p-0 flex-shrink-0"
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Users className="h-4 w-4 mx-auto mb-1" />
                <p className="text-xs">スタッフをドロップ</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              午前の現場
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              午後の現場
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 午前の現場 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <h3 className="text-lg font-semibold">午前の現場</h3>
          <Badge variant="outline">{amSites.length}件</Badge>
        </div>
        <div className="space-y-2">
          {amSites.length > 0 ? (
            amSites.map((site) => (
              <SiteCard key={site.id} site={site} timeSlot="AM" />
            ))
          ) : (
            <div className="flex items-center justify-center h-16 border border-dashed border-muted rounded-lg">
              <div className="text-center">
                <MapPin className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">
                  午前の現場はありません
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 午後の現場 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <h3 className="text-lg font-semibold">午後の現場</h3>
          <Badge variant="outline">{pmSites.length}件</Badge>
        </div>
        <div className="space-y-2">
          {pmSites.length > 0 ? (
            pmSites.map((site) => (
              <SiteCard key={site.id} site={site} timeSlot="PM" />
            ))
          ) : (
            <div className="flex items-center justify-center h-16 border border-dashed border-muted rounded-lg">
              <div className="text-center">
                <MapPin className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">
                  午後の現場はありません
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
