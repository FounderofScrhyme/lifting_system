"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientForm } from "@/components/client/client-form";
import { ClientList } from "@/components/client/client-list";
import { Plus, Building } from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone: string;
  postalCode?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ClientPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setActiveTab("form");
  };

  const handleFormSuccess = () => {
    setEditingClient(null);
    setActiveTab("list");
    setRefreshKey((prev) => prev + 1);
  };

  const handleNewClient = () => {
    setEditingClient(null);
    setActiveTab("form");
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">取引先管理</h1>
          <p className="text-gray-600">取引先の登録・編集・管理を行います</p>
        </div>
        <Button onClick={handleNewClient} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新規登録
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            一覧
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {editingClient ? "編集" : "新規登録"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <ClientList
            onEdit={handleEdit}
            onRefresh={() => setRefreshKey((prev) => prev + 1)}
          />
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          <ClientForm
            initialData={editingClient || undefined}
            clientId={editingClient?.id}
            onSuccess={handleFormSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
