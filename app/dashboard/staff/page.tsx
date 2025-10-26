"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffForm } from "@/components/staff/staff-form";
import { StaffList } from "@/components/staff/staff-list";
import { Plus, Users } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  birthDate: string;
  phone: string;
  email?: string;
  postalCode?: string;
  address?: string;
  emergencyName: string;
  emergencyPhone: string;
  bloodType?: string;
  bloodPressure?: string;
  lastCheckupDate?: string;
  employmentType: "SPOT" | "REGULAR";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setActiveTab("form");
  };

  const handleFormSuccess = () => {
    setEditingStaff(null);
    setActiveTab("list");
    setRefreshKey((prev) => prev + 1);
  };

  const handleNewStaff = () => {
    setEditingStaff(null);
    setActiveTab("form");
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">スタッフ管理</h1>
          <p className="text-gray-600">スタッフの登録・編集・管理を行います</p>
        </div>
        <Button
          onClick={handleNewStaff}
          className="hidden md:flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          新規登録
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            一覧
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {editingStaff ? "編集" : "新規登録"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <StaffList
            onEdit={handleEdit}
            onRefresh={() => setRefreshKey((prev) => prev + 1)}
          />
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          <StaffForm
            initialData={editingStaff || undefined}
            staffId={editingStaff?.id}
            onSuccess={handleFormSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
