"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

interface StaffListProps {
  onEdit: (staff: Staff) => void;
  onRefresh: () => void;
}

export function StaffList({ onEdit, onRefresh }: StaffListProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    fetchStaff();
  }, [currentPage]);

  const fetchStaff = async () => {
    try {
      const response = await axios.get(
        `/api/staff?page=${currentPage}&limit=5`
      );
      setStaff(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("スタッフ一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このスタッフを削除しますか？")) return;

    try {
      await axios.delete(`/api/staff/${id}`);
      toast.success("スタッフを削除しました");
      fetchStaff();
      onRefresh();
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("削除に失敗しました");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  const getEmploymentTypeLabel = (type: "SPOT" | "REGULAR") => {
    return type === "SPOT" ? "スポット" : "レギュラー";
  };

  const getEmploymentTypeVariant = (type: "SPOT" | "REGULAR") => {
    return type === "SPOT" ? "secondary" : "default";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>スタッフ一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">読み込み中...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (staff.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>スタッフ一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">登録されたスタッフがありません</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>スタッフ一覧 ({pagination.total}名)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>電話番号</TableHead>
                <TableHead>メール</TableHead>
                <TableHead>雇用形態</TableHead>
                <TableHead>血液型</TableHead>
                <TableHead>最終健診</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{member.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(member.birthDate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{member.phone}</div>
                      <div className="text-sm text-gray-500">
                        緊急連絡先: {member.emergencyPhone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{member.email || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getEmploymentTypeVariant(member.employmentType)}
                    >
                      {getEmploymentTypeLabel(member.employmentType)}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.bloodType || "-"}</TableCell>
                  <TableCell>
                    {member.lastCheckupDate
                      ? formatDate(member.lastCheckupDate)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(member)}>
                          <Edit className="h-4 w-4 mr-2" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={
                      !pagination.hasPrev
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => {
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === currentPage}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={
                      !pagination.hasNext
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
