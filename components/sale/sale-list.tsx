"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  JapaneseYen,
} from "lucide-react";
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

interface Client {
  id: string;
  name: string;
}

interface SaleListProps {
  onEdit: (sale: Sale) => void;
  onRefresh: () => void;
}

export function SaleList({ onEdit, onRefresh }: SaleListProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [totalAmount, setTotalAmount] = useState(0);

  // 検索条件
  const [searchFilters, setSearchFilters] = useState({
    clientId: "all",
    month: "all",
    year: "all",
  });

  useEffect(() => {
    fetchSales();
    fetchClients();
  }, [currentPage, searchFilters]);

  const fetchSales = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (searchFilters.clientId && searchFilters.clientId !== "all") {
        params.append("clientId", searchFilters.clientId);
      }

      // 年と月の検索条件を適切に送信
      if (searchFilters.year && searchFilters.year !== "all") {
        params.append("year", searchFilters.year);
      }
      if (searchFilters.month && searchFilters.month !== "all") {
        params.append("month", searchFilters.month);
      }

      const response = await axios.get(`/api/sale?${params.toString()}`);
      setSales(response.data.data);
      setPagination(response.data.pagination);
      setTotalAmount(response.data.totalAmount || 0);
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast.error("売上一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get("/api/client?limit=1000");
      setClients(response.data.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この売上を削除しますか？")) return;

    try {
      await axios.delete(`/api/sale/${id}`);
      toast.success("売上を削除しました");
      fetchSales();
      onRefresh();
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("削除に失敗しました");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSales();
  };

  const handleClearSearch = () => {
    setSearchFilters({
      clientId: "all",
      month: "all",
      year: "all",
    });
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-");
    return `${year}年${parseInt(monthNum)}月`;
  };

  // 年の選択肢を生成
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push({ value: year.toString(), label: `${year}年` });
    }
    return years;
  };

  // 月の選択肢を生成
  const generateMonthOptions = () => {
    const months = [];
    for (let i = 1; i <= 12; i++) {
      const month = String(i).padStart(2, "0");
      months.push({ value: month, label: `${i}月` });
    }
    return months;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>売上一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                読み込み中...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>売上一覧 ({pagination.total}件)</CardTitle>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">総売上額</div>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(totalAmount)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 検索フィルター */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientFilter">取引先</Label>
              <Select
                value={searchFilters.clientId}
                onValueChange={(value) =>
                  setSearchFilters({ ...searchFilters, clientId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="取引先を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ての取引先</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearFilter">年</Label>
              <Select
                value={searchFilters.year}
                onValueChange={(value) =>
                  setSearchFilters({ ...searchFilters, year: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="年を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ての年</SelectItem>
                  {generateYearOptions().map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthFilter">月</Label>
              <Select
                value={searchFilters.month}
                onValueChange={(value) =>
                  setSearchFilters({ ...searchFilters, month: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="月を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ての月</SelectItem>
                  {generateMonthOptions().map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4 mr-1" />
                  検索
                </Button>
                <Button onClick={handleClearSearch} variant="outline" size="sm">
                  クリア
                </Button>
              </div>
            </div>
          </div>
        </div>

        {sales.length === 0 ? (
          <div className="text-center py-8">
            <JapaneseYen className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              売上データがありません
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>取引先</TableHead>
                    <TableHead>月</TableHead>
                    <TableHead>売上金額</TableHead>
                    <TableHead>備考</TableHead>
                    <TableHead>登録日</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {sale.client.name}
                      </TableCell>
                      <TableCell>{formatMonth(sale.month)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatAmount(sale.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {sale.notes || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(sale.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(sale)}>
                              <Edit className="h-4 w-4 mr-2" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(sale.id)}
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
