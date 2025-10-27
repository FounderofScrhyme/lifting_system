"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SaleForm } from "@/components/sale/sale-form";
import { SaleList } from "@/components/sale/sale-list";
import { JapaneseYen, Plus } from "lucide-react";

interface Sale {
  id: string;
  clientId: string;
  month: string;
  amount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
  };
}

export default function SalePage() {
  const [activeTab, setActiveTab] = useState("list");
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setActiveTab("form");
  };

  const handleFormSuccess = () => {
    setEditingSale(null);
    setActiveTab("list");
    setRefreshKey((prev) => prev + 1);
  };

  const handleNewSale = () => {
    setEditingSale(null);
    setActiveTab("form");
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">売上管理</h1>
          <p className="text-gray-600">売上の登録・編集・管理を行います</p>
        </div>
        <Button
          onClick={handleNewSale}
          className="hidden md:flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          新規登録
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <JapaneseYen className="h-4 w-4" />
            一覧
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {editingSale ? "編集" : "新規登録"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <SaleList
            onEdit={handleEdit}
            onRefresh={() => setRefreshKey((prev) => prev + 1)}
          />
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          <SaleForm
            initialData={editingSale || undefined}
            saleId={editingSale?.id}
            onSuccess={handleFormSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
