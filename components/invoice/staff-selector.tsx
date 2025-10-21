"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, Phone, MapPin } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  phone: string;
  address: string;
  employmentType: string;
}

interface StaffSelectorProps {
  onStaffSelect: (staff: Staff) => void;
}

export function StaffSelector({ onStaffSelect }: StaffSelectorProps) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch("/api/staff");
        if (response.ok) {
          const data = await response.json();
          setStaffList(data);
          setFilteredStaff(data);
        }
      } catch (error) {
        console.error("スタッフデータ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStaff(staffList);
    } else {
      const filtered = staffList.filter(
        (staff) =>
          staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.phone.includes(searchTerm)
      );
      setFilteredStaff(filtered);
    }
  }, [searchTerm, staffList]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            スタッフ選択
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">読み込み中...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          スタッフ選択
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="スタッフ名または電話番号で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {filteredStaff.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              該当するスタッフが見つかりません
            </div>
          ) : (
            filteredStaff.map((staff) => (
              <Card
                key={staff.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onStaffSelect(staff)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{staff.name}</h3>
                        <Badge
                          variant={
                            staff.employmentType === "REGULAR"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {staff.employmentType === "REGULAR"
                            ? "レギュラー"
                            : "スポット"}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {staff.phone}
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3 w-3 mt-0.5" />
                          <span className="line-clamp-2">{staff.address}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      選択
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

