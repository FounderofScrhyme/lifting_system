// "use client"ディレクティブ: Next.jsでクライアントコンポーネントとして動作することを示す
// クライアントコンポーネントでは、useState、useEffect、イベントハンドラーなどの
// ブラウザ側の機能を使用できます
"use client";

// Reactフックのインポート
// useState: コンポーネント内で状態（データ）を管理するために使用
// useEffect: コンポーネントのマウント時や更新時に処理を実行するために使用
import { useState, useEffect } from "react";
// axios: HTTPリクエストを送信するためのライブラリ
import axios from "axios";
// UIコンポーネントのインポート（shadcn/uiなど）
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
// アイコンライブラリ（lucide-react）
import { MoreHorizontal, Edit, Trash2, User } from "lucide-react";
// トースト通知ライブラリ
import { toast } from "sonner";
// ページネーション（ページ送り）コンポーネント
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// スタッフのデータ型を定義（TypeScript）
// ? がついているフィールドはオプショナル（必須ではない）
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
  employmentType: "SPOT" | "REGULAR"; // 雇用形態はSPOTまたはREGULARのいずれか
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// StaffListコンポーネントが受け取るprops（親コンポーネントから渡されるデータ）の型定義
interface StaffListProps {
  onEdit: (staff: Staff) => void; // 編集ボタンがクリックされたときに呼ばれる関数
  onRefresh: () => void; // リストを更新するときに呼ばれる関数
}

// StaffListコンポーネント: スタッフ一覧を表示するメインコンポーネント
// props: 親コンポーネントから受け取る関数（onEdit, onRefresh）
export function StaffList({ onEdit, onRefresh }: StaffListProps) {
  // useState: コンポーネントの状態（データ）を管理
  // [変数名, 更新関数] = useState(初期値) の形式

  // staff: スタッフ一覧のデータを保持する配列（初期値は空配列）
  const [staff, setStaff] = useState<Staff[]>([]);
  // loading: データ取得中かどうかを表すフラグ（初期値はtrue = 読み込み中）
  const [loading, setLoading] = useState(true);
  // currentPage: 現在表示しているページ番号（初期値は1）
  const [currentPage, setCurrentPage] = useState(1);
  // pagination: ページネーションの情報（ページ数、総件数など）
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10, // 1ページあたりの表示件数
    total: 0, // 総件数
    totalPages: 0, // 総ページ数
    hasNext: false, // 次のページがあるか
    hasPrev: false, // 前のページがあるか
  });

  // useEffect: コンポーネントのマウント時や依存配列の値が変わったときに実行される
  // 第1引数: 実行したい関数
  // 第2引数: 依存配列（この中の値が変わると、第1引数の関数が再実行される）
  // ここでは currentPage が変わるたびに fetchStaff() を実行してデータを再取得
  useEffect(() => {
    fetchStaff();
  }, [currentPage]);

  // スタッフ一覧をAPIから取得する関数
  // async/await: 非同期処理（API呼び出し）を扱うための構文
  const fetchStaff = async () => {
    try {
      // axios.get: GETリクエストを送信してデータを取得
      // クエリパラメータ（?page=1&limit=10）でページ番号と表示件数を指定
      const response = await axios.get(
        `/api/staff?page=${currentPage}&limit=10`
      );

      // レスポンスからデータを取得して、状態を更新
      // || [] は、データが存在しない場合に空配列を設定するためのフォールバック
      setStaff(response.data.data || []);

      // ページネーション情報も更新
      // || {...} は、ページネーション情報が存在しない場合のデフォルト値
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
      // エラーが発生した場合の処理
      // console.error: ブラウザのコンソールにエラーを出力（開発時のデバッグ用）
      console.error("Error fetching staff:", error);
      // toast.error: ユーザーにエラーメッセージを表示
      toast.error("スタッフ一覧の取得に失敗しました");
      // エラー時は空配列を設定して、エラー状態を回避
      setStaff([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      // try/catch/finally: 成功・失敗に関わらず必ず実行される処理
      // ここでは、データ取得が完了したので loading を false に設定
      setLoading(false);
    }
  };

  // スタッフを削除する関数
  // id: 削除するスタッフのID
  const handleDelete = async (id: string) => {
    // confirm: ブラウザの確認ダイアログを表示
    // ユーザーが「キャンセル」をクリックした場合は、returnで処理を中断
    if (!confirm("このスタッフを削除しますか？")) return;

    try {
      // axios.delete: DELETEリクエストを送信してスタッフを削除
      await axios.delete(`/api/staff/${id}`);
      // 成功メッセージを表示
      toast.success("スタッフを削除しました");
      // 削除後、一覧を再取得して最新の状態に更新
      fetchStaff();
      // 親コンポーネントにも更新を通知
      onRefresh();
    } catch (error) {
      // 削除に失敗した場合のエラー処理
      console.error("Error deleting staff:", error);
      toast.error("削除に失敗しました");
    }
  };

  // ページ変更時の処理
  // page: 移動先のページ番号
  const handlePageChange = (page: number) => {
    // 現在のページを更新（これによりuseEffectが発火し、fetchStaff()が実行される）
    setCurrentPage(page);
  };

  // 日付を日本語形式にフォーマットする関数
  // dateString: ISO形式の日付文字列（例: "2024-01-01T00:00:00.000Z"）
  // 戻り値: 日本語形式の日付文字列（例: "2024/1/1"）
  const formatDate = (dateString: string) => {
    // new Date(): 文字列をDateオブジェクトに変換
    // toLocaleDateString("ja-JP"): 日本語ロケールで日付を文字列化
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  // 雇用形態のラベル（表示用テキスト）を取得する関数
  // type: 雇用形態（"SPOT" または "REGULAR"）
  // 戻り値: 日本語のラベル（"スポット" または "レギュラー"）
  const getEmploymentTypeLabel = (type: "SPOT" | "REGULAR") => {
    // 三項演算子: 条件 ? 真の場合の値 : 偽の場合の値
    return type === "SPOT" ? "スポット" : "レギュラー";
  };

  // 雇用形態に応じたBadgeコンポーネントのバリアント（スタイル）を取得する関数
  // type: 雇用形態（"SPOT" または "REGULAR"）
  // 戻り値: Badgeコンポーネントのvariantプロパティに渡す値
  const getEmploymentTypeVariant = (type: "SPOT" | "REGULAR") => {
    return type === "SPOT" ? "secondary" : "default";
  };

  // 条件付きレンダリング: loading が true の場合はローディング表示
  // 早期return: この時点でreturnすることで、以降のコードを実行しない
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>スタッフ一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {/* ローディングスピナーとメッセージを表示 */}
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              {/* animate-spin: Tailwind CSSのアニメーションクラス（回転アニメーション） */}
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">読み込み中...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 条件付きレンダリング: スタッフデータが存在しない場合の表示
  // !staff: staff が null または undefined の場合
  // staff.length === 0: staff が空配列の場合
  if (!staff || staff.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>スタッフ一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 空状態の表示: データがない場合に表示するメッセージ */}
          <div className="text-center py-8">
            {/* Userアイコンを表示 */}
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">登録されたスタッフがありません</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // メインのレンダリング: スタッフ一覧テーブルを表示
  return (
    <Card>
      <CardHeader>
        {/* タイトル: 総件数を表示（pagination.totalは総スタッフ数） */}
        <CardTitle>スタッフ一覧 ({pagination.total}名)</CardTitle>
      </CardHeader>
      <CardContent>
        {/* overflow-x-auto: 横スクロール可能にする（テーブルが大きい場合） */}
        <div className="overflow-x-auto">
          <Table>
            {/* テーブルのヘッダー行 */}
            <TableHeader>
              <TableRow>
                <TableHead>名前</TableHead>
                <TableHead>電話番号</TableHead>
                <TableHead>メール</TableHead>
                <TableHead>雇用形態</TableHead>
                <TableHead>血液型</TableHead>
                <TableHead>最終健診</TableHead>
                {/* 操作ボタン用の列 */}
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            {/* テーブルのボディ: スタッフデータを一行ずつ表示 */}
            <TableBody>
              {/* map: 配列の各要素に対して処理を実行して新しい配列を作成 */}
              {/* key: Reactが要素を識別するための一意のキー（必須） */}
              {staff.map((member) => (
                <TableRow key={member.id}>
                  {/* 名前セル: 名前と生年月日を表示 */}
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{member.name}</div>
                      <div className="text-sm text-gray-500">
                        {/* formatDate関数で日付を日本語形式に変換 */}
                        {formatDate(member.birthDate)}
                      </div>
                    </div>
                  </TableCell>
                  {/* 電話番号セル: 電話番号と緊急連絡先を表示 */}
                  <TableCell>
                    <div>
                      <div>{member.phone}</div>
                      <div className="text-sm text-gray-500">
                        緊急連絡先: {member.emergencyPhone}
                      </div>
                    </div>
                  </TableCell>
                  {/* メールセル: メールアドレスがあれば表示、なければ "-" */}
                  <TableCell>{member.email || "-"}</TableCell>
                  {/* 雇用形態セル: Badgeコンポーネントで表示 */}
                  <TableCell>
                    <Badge
                      variant={getEmploymentTypeVariant(member.employmentType)}
                    >
                      {getEmploymentTypeLabel(member.employmentType)}
                    </Badge>
                  </TableCell>
                  {/* 血液型セル: 血液型があれば表示、なければ "-" */}
                  <TableCell>{member.bloodType || "-"}</TableCell>
                  {/* 最終健診セル: 日付があればフォーマットして表示、なければ "-" */}
                  <TableCell>
                    {/* 三項演算子: 条件 ? 真の場合 : 偽の場合 */}
                    {member.lastCheckupDate
                      ? formatDate(member.lastCheckupDate)
                      : "-"}
                  </TableCell>
                  {/* 操作ボタンセル: ドロップダウンメニュー */}
                  <TableCell>
                    <DropdownMenu>
                      {/* ドロップダウンのトリガー（三本線アイコン） */}
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      {/* ドロップダウンのメニュー内容 */}
                      <DropdownMenuContent align="end">
                        {/* 編集メニュー項目: クリックでonEdit関数を実行 */}
                        <DropdownMenuItem onClick={() => onEdit(member)}>
                          <Edit className="h-4 w-4 mr-2" />
                          編集
                        </DropdownMenuItem>
                        {/* 削除メニュー項目: クリックでhandleDelete関数を実行 */}
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

        {/* ページネーション: 総ページ数が2ページ以上の時だけ表示 */}
        {/* &&演算子: 左側がtrueの場合のみ右側を表示（条件付きレンダリング） */}
        {pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                {/* 前のページボタン */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={
                      // 前のページがない場合はクリック不可にして視覚的に無効化
                      !pagination.hasPrev
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* ページ番号ボタン */}
                {/* Array.from: 指定した長さの配列を作成（例: [1, 2, 3, ...]） */}
                {/* 第1引数: 配列の長さを指定するオブジェクト */}
                {/* 第2引数: 各要素を生成する関数（インデックスiを受け取ってi+1を返す） */}
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => {
                  // 表示するページ番号の条件:
                  // 1. 最初のページ（1ページ目）
                  // 2. 最後のページ
                  // 3. 現在のページの前後1ページ（currentPage ± 1）
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === currentPage} // 現在のページをハイライト
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  // 省略記号（...）を表示する条件:
                  // 現在のページの前後2ページの位置（currentPage ± 2）
                  else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  // それ以外のページは表示しない（nullを返す）
                  return null;
                })}

                {/* 次のページボタン */}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={
                      // 次のページがない場合はクリック不可にして視覚的に無効化
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
