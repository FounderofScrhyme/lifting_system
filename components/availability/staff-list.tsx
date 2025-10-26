"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Staff } from "@/types/staff";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Calendar,
  Phone,
  Mail,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface StaffListProps {
  onStaffSelect: (staff: Staff) => void;
}

export function StaffList({ onStaffSelect }: StaffListProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // デバウンス用のuseEffect
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsSearching(false);
    }, 1000); // 1秒待機

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  useEffect(() => {
    fetchStaff();
  }, [currentPage, debouncedSearchQuery]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (debouncedSearchQuery.trim()) {
        params.append("search", debouncedSearchQuery.trim());
      }

      const response = await axios.get(`/api/staff?${params.toString()}`);
      setStaff(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotal(response.data.pagination.total);
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
        return "bg-blue-100 text-blue-800";
      case "SPOT":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // 検索時は最初のページに戻る
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
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
      <div className="space-y-4">
        {/* 検索バー */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="スタッフ名で検索..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="text-center py-8">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          {debouncedSearchQuery ? (
            <div>
              <p className="text-muted-foreground">
                「{debouncedSearchQuery}
                」に一致するスタッフが見つかりませんでした
              </p>
              <Button variant="outline" onClick={clearSearch} className="mt-2">
                検索をクリア
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">
              登録されたスタッフがいません
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 検索バー */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="スタッフ名で検索..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          スタッフをクリックして勤怠設定を行います
          {isSearching && <span className="ml-2 text-blue-600">検索中...</span>}
        </div>
        <div className="text-sm text-muted-foreground">
          {debouncedSearchQuery ? (
            <>
              「{debouncedSearchQuery}」の検索結果: {total}名中{" "}
              {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, total)}
              名を表示
            </>
          ) : (
            <>
              全{total}名中 {(currentPage - 1) * 10 + 1}-
              {Math.min(currentPage * 10, total)}名を表示
            </>
          )}
        </div>
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

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            前へ
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            次へ
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
