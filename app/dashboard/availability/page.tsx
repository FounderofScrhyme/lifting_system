"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffList } from "@/components/availability/staff-list";
import { AvailabilityCalendar } from "@/components/availability/availability-calendar";
import { Staff } from "@/types/staff";

export default function AvailabilityPage() {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [activeTab, setActiveTab] = useState("staff");

  const handleStaffSelect = (staff: Staff) => {
    setSelectedStaff(staff);
    setActiveTab("calendar");
  };

  const handleBackToStaff = () => {
    setSelectedStaff(null);
    setActiveTab("staff");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">勤怠管理</h1>
          <p className="text-muted-foreground">
            スタッフの出勤可能日・休日を管理します
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="staff">スタッフ一覧</TabsTrigger>
          {selectedStaff && (
            <TabsTrigger value="calendar">
              {selectedStaff.name}の勤怠設定
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>スタッフ一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffList onStaffSelect={handleStaffSelect} />
            </CardContent>
          </Card>
        </TabsContent>

        {selectedStaff && (
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedStaff.name}の勤怠設定
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (
                    {selectedStaff.employmentType === "REGULAR"
                      ? "社員"
                      : "スポット"}
                    )
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AvailabilityCalendar
                  staff={selectedStaff}
                  onBack={handleBackToStaff}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
