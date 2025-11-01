"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, User, Check } from "lucide-react";
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
  address: string;
  emergencyPhone: string;
  bloodType?: string;
  lastCheckupDate?: string;
  employmentType: "SPOT" | "REGULAR";
}

interface StaffSelectorProps {
  onStaffSelect: (staff: {
    id: string;
    name: string;
    phone: string;
    address: string;
    employmentType: string;
  }) => void;
}

export function StaffSelector({ onStaffSelect }: StaffSelectorProps) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [allStaffList, setAllStaffList] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/staff?page=${currentPage}&limit=10`
      );
      const list = response.data.data || [];
      setStaffList(list);
      setPagination(
        response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }
      );
    } catch (error) {
      console.error("スタッフデータ取得エラー:", error);
      setStaffList([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // 検索用に全データを取得
  const fetchAllStaff = async () => {
    try {
      const response = await axios.get(`/api/staff?page=1&limit=1000`);
      const list = response.data.data || [];
      setAllStaffList(list);
    } catch (error) {
      console.error("全スタッフデータ取得エラー:", error);
      setAllStaffList([]);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      fetchAllStaff();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStaff([]);
      setCurrentPage(1);
    } else {
      const filtered = allStaffList.filter(
        (staff) =>
          staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.phone.includes(searchTerm)
      );
      setFilteredStaff(filtered);
    }
  }, [searchTerm, allStaffList]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  // 検索結果を表示するスタッフリスト
  const displayStaff = searchTerm.trim() !== "" ? filteredStaff : staffList;

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

  if (!staffList || staffList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            スタッフ選択
          </CardTitle>
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
        <CardTitle>
          スタッフ選択 ({searchTerm.trim() !== "" ? filteredStaff.length : pagination.total}名)
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

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>電話番号</TableHead>
                <TableHead>住所</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="text-muted-foreground">
                      該当するスタッフが見つかりません
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayStaff.map((member) => (
                  <TableRow
                    key={member.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      onStaffSelect({
                        id: member.id,
                        name: member.name,
                        phone: member.phone,
                        address: member.address || "",
                        employmentType: member.employmentType,
                      });
                    }}
                  >
                    <TableCell className="font-medium">
                      <div className="font-semibold">{member.name}</div>
                    </TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{member.address || "-"}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStaffSelect({
                            id: member.id,
                            name: member.name,
                            phone: member.phone,
                            address: member.address || "",
                            employmentType: member.employmentType,
                          });
                        }}
                        className="flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        選択
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {searchTerm.trim() === "" && pagination.totalPages > 1 && (
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
