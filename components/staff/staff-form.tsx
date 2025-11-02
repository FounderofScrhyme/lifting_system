// "use client"ディレクティブ: Next.jsでクライアントコンポーネントとして動作することを示す
// フォームコンポーネントでは、ユーザー入力やイベントハンドラーを使用するため必要
"use client";

// Reactフックのインポート
// useState: コンポーネント内で状態（データ）を管理するために使用
// useEffect: コンポーネントのマウント時や更新時に処理を実行するために使用
import { useState, useEffect } from "react";
// react-hook-form: フォームの状態管理とバリデーションを簡素化するライブラリ
import { useForm } from "react-hook-form";
// zodResolver: Zodスキーマをreact-hook-formのリゾルバーとして使用するためのアダプター
import { zodResolver } from "@hookform/resolvers/zod";
// zod: TypeScriptファーストのスキーマ検証ライブラリ（バリデーションルールを定義）
import * as z from "zod";
// axios: HTTPリクエストを送信するためのライブラリ
import axios from "axios";
// カスタムフック: 電話番号の自動フォーマット機能（ハイフン挿入など）
import { usePhoneFormat } from "@/hooks/use-phone-format";
// カスタムフック: 郵便番号から住所を自動取得する機能
import { useAddressAutofill } from "@/hooks/use-address-autofill";
// UIコンポーネントのインポート（shadcn/uiなど）
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// トースト通知ライブラリ
import { toast } from "sonner";

// Zodスキーマ: フォームのバリデーションルールを定義
// z.object(): オブジェクトの形状と各フィールドのバリデーションルールを定義
// このスキーマに基づいてフォームデータの型安全性と検証が行われる
const staffSchema = z.object({
  // 名前フィールド: 必須入力
  // .string(): 文字列型であることを検証
  // .min(1): 最低1文字以上であることを検証（空文字列を禁止）
  name: z
    .string({
      message: "名前を入力してください",
    })
    .min(1, "名前は必須です"),

  // 生年月日フィールド: 必須入力
  // 日付形式の文字列として扱う（HTML5のdate inputで使用）
  birthDate: z
    .string({
      message: "生年月日を入力してください",
    })
    .min(1, "生年月日は必須です"),

  // 電話番号フィールド: 必須入力
  phone: z
    .string({
      message: "電話番号を入力してください",
    })
    .min(1, "電話番号は必須です"),

  // メールアドレスフィールド: オプション
  // .email(): 有効なメールアドレス形式であることを検証
  // .optional(): 入力がなくても良い（undefinedを許可）
  // .or(z.literal("")): 空文字列も許可（フォームで空欄にできる）
  email: z
    .string({
      message: "メールアドレスを正しく入力してください",
    })
    .email("有効なメールアドレスを入力してください")
    .optional()
    .or(z.literal("")),

  // 郵便番号フィールド: オプション
  postalCode: z
    .string({
      message: "郵便番号は文字列で入力してください",
    })
    .optional(),

  // 住所フィールド: オプション
  address: z
    .string({
      message: "住所は文字列で入力してください",
    })
    .optional(),

  // 緊急連絡先名前フィールド: 必須入力
  emergencyName: z
    .string({
      message: "緊急連絡先の名前を入力してください",
    })
    .min(1, "緊急連絡先の名前は必須です"),

  // 緊急連絡先電話番号フィールド: 必須入力
  emergencyPhone: z
    .string({
      message: "緊急連絡先の電話番号を入力してください",
    })
    .min(1, "緊急連絡先の電話番号は必須です"),

  // 血液型フィールド: オプション
  // A, B, AB, Oのいずれかを選択（Selectコンポーネントで制御）
  bloodType: z
    .string({
      message: "血液型は文字列で入力してください",
    })
    .optional(),

  // 血圧フィールド: オプション
  // 例: "120/80" のような形式で入力
  bloodPressure: z
    .string({
      message: "血圧は文字列で入力してください",
    })
    .optional(),

  // 最終健診日フィールド: オプション
  // 日付形式の文字列として扱う
  lastCheckupDate: z
    .string({
      message: "最終健診日は正しい日付形式で入力してください",
    })
    .optional(),

  // 雇用形態フィールド: 必須選択
  // z.enum(): 指定した値のいずれかであることを検証
  // "SPOT"（スポット）または "REGULAR"（レギュラー）のいずれか
  employmentType: z.enum(["SPOT", "REGULAR"], {
    message: "雇用形態を選択してください",
  }),

  // 備考フィールド: オプション
  // その他の情報を自由に入力できるテキストエリア
  notes: z
    .string({
      message: "備考は文字列で入力してください",
    })
    .optional(),
});

// フォームデータの型定義
// z.infer: ZodスキーマからTypeScriptの型を自動生成
// これにより、フォームデータの型安全性が保証される
type StaffFormData = z.infer<typeof staffSchema>;

// StaffFormコンポーネントが受け取るprops（親コンポーネントから渡されるデータ）の型定義
interface StaffFormProps {
  onSuccess?: () => void; // フォーム送信成功時に呼ばれるコールバック関数（オプション）
  initialData?: Partial<StaffFormData>; // 初期データ（編集モードで使用、オプション）
  // Partial<>: すべてのフィールドをオプショナルにする型ユーティリティ
  staffId?: string; // スタッフID（編集モードの場合に渡される、オプション）
}

// StaffFormコンポーネント: スタッフ情報の登録・編集フォーム
// props: 親コンポーネントから受け取る関数とデータ
export function StaffForm({ onSuccess, initialData, staffId }: StaffFormProps) {
  // フォーム送信中の状態を管理
  // isSubmitting: 送信処理が実行中かどうかを表すフラグ
  const [isSubmitting, setIsSubmitting] = useState(false);

  // react-hook-formのuseFormフックを使用してフォームを初期化
  // register: 入力フィールドをフォームに登録する関数
  // handleSubmit: フォーム送信時の処理を実行する関数
  // setValue: フォームの値を手動で設定する関数
  // watch: フォームの特定のフィールドの値を監視（リアルタイムで取得）する関数
  // formState.errors: バリデーションエラーの情報を含むオブジェクト
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema), // Zodスキーマをリゾルバーとして設定
    defaultValues: initialData, // 初期値としてinitialDataを設定（編集モードで使用）
  });

  // 雇用形態フィールドの値を監視
  // リアルタイムで雇用形態の選択状態を取得
  const employmentType = watch("employmentType");

  // 電話番号の自動ハイフン付与機能
  // usePhoneFormat: カスタムフック（入力中に自動的にハイフンを挿入）
  // 通常の電話番号用
  const phoneFormat = usePhoneFormat(initialData?.phone || "");
  // 緊急連絡先の電話番号用
  const emergencyPhoneFormat = usePhoneFormat(
    initialData?.emergencyPhone || ""
  );

  // 住所自動取得機能（郵便番号入力から住所を自動補完）
  // useAddressAutofill: カスタムフック（郵便番号APIから住所を取得）
  const {
    postalCodeFormat, // 郵便番号のフォーマット済み値
    handlePostalCodeChange, // 郵便番号入力時の変更ハンドラー
    handlePostalCodeCompositionEnd, // IME入力確定時のハンドラー
    isLoadingAddress, // 住所取得中かどうかのフラグ
  } = useAddressAutofill({
    // 住所が見つかった時に呼ばれるコールバック（フォームの住所フィールドを自動入力）
    onAddressFound: (address) => setValue("address", address),
    // 郵便番号が変更された時に呼ばれるコールバック（フォームの郵便番号フィールドを更新）
    onPostalCodeChange: (code) => setValue("postalCode", code),
  });

  // 日付フォーマット関数: ISO形式の日付文字列をHTML5のdate input用形式（YYYY-MM-DD）に変換
  // dateString: ISO形式の日付文字列（例: "2024-01-01T00:00:00.000Z"）
  // 戻り値: HTML5のdate inputで使用できる形式（例: "2024-01-01"）
  const formatDateForInput = (dateString: string | undefined): string => {
    // 日付文字列が存在しない場合は空文字列を返す
    if (!dateString) return "";
    try {
      // new Date(): 文字列をDateオブジェクトに変換
      const date = new Date(dateString);
      // isNaN(date.getTime()): 無効な日付かどうかをチェック
      if (isNaN(date.getTime())) return "";
      // toISOString().split("T")[0]: ISO形式をYYYY-MM-DD形式に変換
      return date.toISOString().split("T")[0];
    } catch {
      // エラーが発生した場合は空文字列を返す
      return "";
    }
  };

  // 初期データが変更された時にフォームの値を更新
  // useEffect: 依存配列の値が変更された時に実行される
  // 編集モードでinitialDataが渡された場合、フォームに初期値を設定
  useEffect(() => {
    if (initialData) {
      // 基本フィールドの設定
      // setValue: react-hook-formの関数で、フォームの値を手動で設定
      // || "": undefinedやnullの場合は空文字列を設定
      setValue("name", initialData.name || "");
      // formatDateForInput: 日付をHTML5のdate input用形式に変換
      setValue("birthDate", formatDateForInput(initialData.birthDate));
      setValue("phone", initialData.phone || "");
      setValue("email", initialData.email || "");
      setValue("postalCode", initialData.postalCode || "");
      setValue("address", initialData.address || "");
      setValue("emergencyName", initialData.emergencyName || "");
      setValue("emergencyPhone", initialData.emergencyPhone || "");
      setValue("bloodType", initialData.bloodType || "");
      setValue("bloodPressure", initialData.bloodPressure || "");
      setValue(
        "lastCheckupDate",
        formatDateForInput(initialData.lastCheckupDate)
      );
      // 雇用形態のデフォルト値は "SPOT"
      setValue("employmentType", initialData.employmentType || "SPOT");
      setValue("notes", initialData.notes || "");
    }
    // 依存配列: これらの値が変更されるとuseEffectが再実行される
    // initialDataの各フィールドとsetValueを監視
  }, [
    initialData?.name,
    initialData?.birthDate,
    initialData?.phone,
    initialData?.email,
    initialData?.postalCode,
    initialData?.address,
    initialData?.emergencyName,
    initialData?.emergencyPhone,
    initialData?.bloodType,
    initialData?.bloodPressure,
    initialData?.lastCheckupDate,
    initialData?.employmentType,
    initialData?.notes,
    setValue,
  ]);

  // フォーム送信処理
  // handleSubmitでラップされた関数（バリデーション成功時のみ実行される）
  // data: バリデーション済みのフォームデータ（StaffFormData型）
  const onSubmit = async (data: StaffFormData) => {
    // 送信開始: ボタンを無効化して重複送信を防止
    setIsSubmitting(true);
    try {
      // フォーマットされた電話番号と郵便番号を設定
      // ...data: スプレッド演算子で既存のフォームデータを展開
      // その後、カスタムフックでフォーマット済みの値を上書き
      const formData = {
        ...data,
        phone: phoneFormat.value, // ハイフン付きの電話番号
        emergencyPhone: emergencyPhoneFormat.value, // ハイフン付きの緊急連絡先電話番号
        postalCode: postalCodeFormat.value, // ハイフン付きの郵便番号
      };

      // staffIdが存在する場合は更新モード、存在しない場合は新規作成モード
      if (staffId) {
        // 更新モード: PUTリクエストで既存のスタッフ情報を更新
        await axios.put(`/api/staff/${staffId}`, formData);
        toast.success("スタッフ情報を更新しました");
      } else {
        // 新規作成モード: POSTリクエストで新しいスタッフを登録
        await axios.post("/api/staff", formData);
        toast.success("スタッフを登録しました");
      }
      // 成功時に親コンポーネントのコールバックを実行（例: リストの更新）
      // ?.: オプショナルチェーン（onSuccessが存在する場合のみ実行）
      onSuccess?.();
    } catch (error) {
      // エラー処理: コンソールにエラーを出力（開発時のデバッグ用）
      console.error("Error saving staff:", error);
      // ユーザーにエラーメッセージを表示
      toast.error("エラーが発生しました");
    } finally {
      // try/catch/finally: 成功・失敗に関わらず必ず実行される処理
      // 送信完了: ボタンを再有効化
      setIsSubmitting(false);
    }
  };

  // JSX: フォームのUIをレンダリング
  return (
    <Card>
      <CardHeader>
        {/* タイトル: 編集モードか登録モードかで表示を切り替え */}
        {/* 三項演算子: staffIdが存在すれば編集、存在しなければ登録 */}
        <CardTitle>{staffId ? "スタッフ情報編集" : "スタッフ登録"}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* フォーム要素 */}
        {/* onSubmit: フォーム送信時にhandleSubmitでラップされたonSubmit関数を実行 */}
        {/* handleSubmit: バリデーションを実行し、成功時のみonSubmitを呼び出す */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* グリッドレイアウト: モバイルは1列、デスクトップは2列 */}
          {/* space-y-4: 縦方向の要素間隔を設定 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 名前フィールド */}
            <div className="space-y-2">
              {/* * は必須項目を示す */}
              <Label htmlFor="name">名前 *</Label>
              {/* register("name"): react-hook-formでフィールドを登録 */}
              {/* {...register("name")}: スプレッド演算子でregisterが返すpropsを展開 */}
              <Input id="name" {...register("name")} placeholder="山田太郎" />
              {/* エラー表示: バリデーションエラーがある場合のみ表示 */}
              {/* errors.name: Zodスキーマのバリデーションエラー情報 */}
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* 生年月日フィールド */}
            <div className="space-y-2">
              <Label htmlFor="birthDate">生年月日 *</Label>
              {/* type="date": HTML5の日付入力フィールド */}
              {/* watch("birthDate"): フォームの値をリアルタイムで監視 */}
              {/* setValue: 値が変更されたときにフォームの値を更新 */}
              <Input
                id="birthDate"
                type="date"
                value={watch("birthDate") || ""}
                onChange={(e) => setValue("birthDate", e.target.value)}
              />
              {errors.birthDate && (
                <p className="text-sm text-red-500">
                  {errors.birthDate.message}
                </p>
              )}
            </div>

            {/* 電話番号フィールド（自動ハイフン付与機能付き） */}
            <div className="space-y-2">
              <Label htmlFor="phone">電話番号 *</Label>
              {/* 電話番号の自動フォーマット機能を使用 */}
              {/* phoneFormat.value: ハイフンが自動挿入された電話番号 */}
              {/* phoneFormat.onChange: 値変更時のハンドラー */}
              {/* onInput, onCompositionStart, onCompositionEnd: IME入力対応 */}
              {/* inputMode="numeric": モバイルで数値キーボードを表示 */}
              {/* autoComplete="tel": ブラウザの自動補完機能を有効化 */}
              <Input
                id="phone"
                value={phoneFormat.value}
                onChange={(e) => {
                  phoneFormat.onChange(e);
                  setValue("phone", phoneFormat.value);
                }}
                onInput={phoneFormat.onInput}
                onCompositionStart={phoneFormat.onCompositionStart}
                onCompositionEnd={phoneFormat.onCompositionEnd}
                inputMode="numeric"
                autoComplete="tel"
                placeholder="090-1234-5678"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* メールアドレスフィールド（オプション） */}
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              {/* type="email": HTML5のメールアドレス入力フィールド */}
              {/* ブラウザが自動的にメールアドレス形式をチェック */}
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* 郵便番号フィールド（住所自動取得機能付き） */}
            <div className="space-y-2">
              <Label htmlFor="postalCode">郵便番号</Label>
              {/* 郵便番号入力から住所を自動取得する機能 */}
              {/* handlePostalCodeChange: 郵便番号入力時の処理（住所検索API呼び出しなど） */}
              {/* handlePostalCodeCompositionEnd: IME入力確定時の処理 */}
              {/* autoComplete="postal-code": ブラウザの郵便番号自動補完機能 */}
              <Input
                id="postalCode"
                value={postalCodeFormat.value}
                onChange={(e) => {
                  handlePostalCodeChange(e);
                  setValue("postalCode", postalCodeFormat.value);
                }}
                onInput={postalCodeFormat.onInput}
                onCompositionStart={postalCodeFormat.onCompositionStart}
                onCompositionEnd={handlePostalCodeCompositionEnd}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="123-4567"
              />
              {/* 住所取得中の表示 */}
              {isLoadingAddress && (
                <p className="text-sm text-blue-500">住所を取得中...</p>
              )}
            </div>

            {/* 住所フィールド（郵便番号から自動入力される） */}
            <div className="space-y-2">
              <Label htmlFor="address">住所</Label>
              {/* 郵便番号入力時に自動的に入力される（手動入力も可能） */}
              <Input
                id="address"
                {...register("address")}
                placeholder="東京都渋谷区..."
              />
            </div>

            {/* 緊急連絡先名前フィールド（必須） */}
            <div className="space-y-2">
              <Label htmlFor="emergencyName">緊急連絡先名前 *</Label>
              <Input
                id="emergencyName"
                {...register("emergencyName")}
                placeholder="山田花子"
              />
              {errors.emergencyName && (
                <p className="text-sm text-red-500">
                  {errors.emergencyName.message}
                </p>
              )}
            </div>

            {/* 緊急連絡先電話番号フィールド（必須、自動ハイフン付与機能付き） */}
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">緊急連絡先電話番号 *</Label>
              {/* 電話番号と同様に自動ハイフン付与機能を使用 */}
              <Input
                id="emergencyPhone"
                value={emergencyPhoneFormat.value}
                onChange={(e) => {
                  emergencyPhoneFormat.onChange(e);
                  setValue("emergencyPhone", emergencyPhoneFormat.value);
                }}
                onInput={emergencyPhoneFormat.onInput}
                onCompositionStart={emergencyPhoneFormat.onCompositionStart}
                onCompositionEnd={emergencyPhoneFormat.onCompositionEnd}
                inputMode="numeric"
                autoComplete="tel"
                placeholder="090-1234-5678"
              />
              {errors.emergencyPhone && (
                <p className="text-sm text-red-500">
                  {errors.emergencyPhone.message}
                </p>
              )}
            </div>

            {/* 血液型フィールド（オプション、ドロップダウン選択） */}
            <div className="space-y-2">
              <Label htmlFor="bloodType">血液型</Label>
              {/* Selectコンポーネント: ドロップダウンメニューで選択 */}
              {/* onValueChange: 値が変更されたときにフォームの値を更新 */}
              <Select
                value={watch("bloodType") || ""}
                onValueChange={(value) => setValue("bloodType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="血液型を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A型</SelectItem>
                  <SelectItem value="B">B型</SelectItem>
                  <SelectItem value="AB">AB型</SelectItem>
                  <SelectItem value="O">O型</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 血圧フィールド（オプション） */}
            <div className="space-y-2">
              <Label htmlFor="bloodPressure">血圧</Label>
              {/* 例: "120/80" のような形式で入力 */}
              <Input
                id="bloodPressure"
                {...register("bloodPressure")}
                placeholder="120/80"
              />
            </div>

            {/* 最終健康診断日フィールド（オプション） */}
            <div className="space-y-2">
              <Label htmlFor="lastCheckupDate">最終健康診断日</Label>
              {/* type="date": HTML5の日付入力フィールド */}
              <Input
                id="lastCheckupDate"
                type="date"
                value={watch("lastCheckupDate") || ""}
                onChange={(e) => setValue("lastCheckupDate", e.target.value)}
              />
            </div>

            {/* 雇用形態フィールド（必須、ラジオボタン選択） */}
            <div className="space-y-2">
              <Label htmlFor="employmentType">雇用形態 *</Label>
              {/* ラジオボタンで選択: SPOT（スポット）または REGULAR（レギュラー） */}
              <div className="flex gap-4">
                {/* スポット選択 */}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="employmentType-spot"
                    name="employmentType"
                    value="SPOT"
                    checked={watch("employmentType") === "SPOT"}
                    onChange={(e) =>
                      setValue(
                        "employmentType",
                        e.target.value as "SPOT" | "REGULAR"
                      )
                    }
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <Label
                    htmlFor="employmentType-spot"
                    className="text-sm font-normal cursor-pointer"
                  >
                    スポット
                  </Label>
                </div>
                {/* レギュラー選択 */}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="employmentType-regular"
                    name="employmentType"
                    value="REGULAR"
                    checked={watch("employmentType") === "REGULAR"}
                    onChange={(e) =>
                      setValue(
                        "employmentType",
                        e.target.value as "SPOT" | "REGULAR"
                      )
                    }
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <Label
                    htmlFor="employmentType-regular"
                    className="text-sm font-normal cursor-pointer"
                  >
                    レギュラー
                  </Label>
                </div>
              </div>
              {errors.employmentType && (
                <p className="text-sm text-red-500">
                  {errors.employmentType.message}
                </p>
              )}
            </div>
          </div>

          {/* 備考フィールド（オプション、複数行入力） */}
          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            {/* Textareaコンポーネント: 複数行のテキスト入力 */}
            {/* rows={3}: デフォルトで3行分の高さを表示 */}
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="その他の情報..."
              rows={3}
            />
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-2">
            {/* type="submit": フォーム送信を実行するボタン */}
            {/* disabled: 送信中の場合はボタンを無効化（重複送信を防止） */}
            {/* 三項演算子: 送信中は "保存中..."、編集モードなら "更新"、新規登録なら "登録" を表示 */}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : staffId ? "更新" : "登録"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
