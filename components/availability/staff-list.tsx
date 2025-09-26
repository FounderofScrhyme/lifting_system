"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Staff } from "@/types/staff";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Calendar, Phone, Mail, Clock } from "lucide-react";
import { toast } from "sonner";

interface StaffListProps {
  onStaffSelect: (staff: Staff) => void;
}

export function StaffList({ onStaffSelect }: StaffListProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/staff");
      setStaff(response.data.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("スタッフデータの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

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

  const getAvailabilityTypeLabel = (type: string) => {
    switch (type) {
      case "REGULAR":
        return "休日設定";
      case "SPOT":
        return "出勤可能日設定";
      default:
        return "勤怠設定";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">登録されたスタッフがいません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        スタッフをクリックして勤怠設定を行います
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名前</TableHead>
            <TableHead>雇用形態</TableHead>
            <TableHead>連絡先</TableHead>
            <TableHead>設定内容</TableHead>
            <TableHead className="w-[100px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => (
            <TableRow
              key={member.id}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(member.birthDate).toLocaleDateString("ja-JP")}
                      生まれ
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  className={getEmploymentTypeColor(member.employmentType)}
                >
                  {getEmploymentTypeLabel(member.employmentType)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {member.phone && (
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3 text-gray-500" />
                      {member.phone}
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3 text-gray-500" />
                      {member.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {getAvailabilityTypeLabel(member.employmentType)}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStaffSelect(member)}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  設定
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
