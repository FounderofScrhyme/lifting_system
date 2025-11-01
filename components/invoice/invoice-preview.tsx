"use client";

interface Staff {
  id: string;
  name: string;
  phone: string;
  address: string;
  employmentType: string;
}

interface InvoicePreviewProps {
  staff: Staff;
  amount: string;
  issueDate: string;
  siteNames: string[];
}

export function InvoicePreview({
  staff,
  amount,
  issueDate,
  siteNames,
}: InvoicePreviewProps) {
  const rows = Array.from({ length: 12 }, (_, i) => i + 1);

  // 日付を日本語形式に変換
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}年${month}月${day}日`;
    } catch (error) {
      return dateString;
    }
  };

  const formattedDate = issueDate ? formatDate(issueDate) : "";

  return (
    <>
      {/* プレビュー用の外側コンテナ（印刷時は非表示） */}
      <div className="min-h-screen bg-neutral-100 p-4 print:hidden flex items-center justify-center relative">
        {/* 2枚の請求書コンテナ（A4横向き、横並び） */}
        <div className="w-[297mm] h-[210mm] flex flex-row gap-0 items-center justify-center">
          {/* 1枚目の請求書 */}
          <section
            className=" pt-10
            bg-white shadow
            w-[148.5mm] h-[210mm] p-[2.5mm] mx-0
            print:shadow-none print:w-[148.5mm] print:h-[210mm] print:p-[2.5mm] print:mx-0
            text-[8px] print:text-[8px] leading-tight
            font-[system-ui]
          "
          >
            {/* ヘッダー行 */}
            <header className="relative">
              <div className="flex items-start justify-between">
                <div className="text-[12px] print:text-[12px] tracking-wide font-medium text-blue-800">
                  請 求 書（控）
                </div>

                <div className="flex items-center gap-1 print:gap-1 text-blue-900 text-[7px] print:text-[7px]">
                  {formattedDate && (
                    <span className="mr-2 print:mr-1">{formattedDate}</span>
                  )}
                  <span>年</span>
                  <span className="inline-block w-4 print:w-4 border-b border-blue-700" />
                  <span>月</span>
                  <span className="inline-block w-4 print:w-4 border-b border-blue-700" />
                  <span>日</span>
                  <span className="inline-block w-4 print:w-4 border-b border-blue-700" />
                  <span className="ml-2 print:ml-1">No.</span>
                  <span className="inline-block w-12 print:w-12 border-b border-blue-700" />
                </div>
              </div>
            </header>

            {/* 宛名・文言行 */}
            <div className="mt-1.5 print:mt-1">
              <div className="flex items-center justify-between">
                <div className="text-[10px] print:text-[10px] text-blue-900">
                  (株)LIFTING様
                </div>
              </div>
              <div className="mt-1 print:mt-0.5 flex items-start justify-between text-blue-900 text-[7px] print:text-[7px]">
                <div>下記のとおり御請求申し上げます</div>

                {/* スタッフ情報（右側） */}
                <div className="text-right space-y-0.5 print:space-y-0.5">
                  {staff.name && <div>氏名: {staff.name}</div>}
                  {staff.address && <div>住所: {staff.address}</div>}
                  {staff.phone && <div>電話番号: {staff.phone}</div>}

                  {/* 登録番号 */}
                  <div className="mt-1 print:mt-0.5 flex items-center justify-end gap-1.5 print:gap-1.5">
                    <span>登録番号</span>
                    <span className="inline-block w-[72px] print:w-[72px] border-b border-blue-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* メインテーブル */}
            <div className="mt-0.5 print:mt-0.25 border border-blue-700 text-blue-900">
              {/* テーブルヘッダ（2段構造の右肩に“消費税額等”） */}
              <div className="grid grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] print:grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr]">
                {/* 上段の右肩ラベル */}
                <div className="col-span-8 border-b border-blue-700">
                  <div className="inline-block px-1.5 print:px-1.5 py-0.5 print:py-0.5 text-blue-900">
                    税込合計金額
                    {amount && (
                      <span className="ml-2 print:ml-2 text-right tabular-nums">
                        ¥{amount}
                      </span>
                    )}
                  </div>
                  <div className="ml-auto w-[88px] print:w-[88px] pb-1 print:pb-1 border-l border-blue-700">
                    消費税額等
                  </div>
                </div>

                {/* 見出し行 */}
                <div className="contents text-center">
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    月日
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    品名
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    数量
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    単価
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    金額（税抜・税込）
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    {/* 金額（税抜・税込）を2分割にみせる縦仕切り */}
                    <div className="relative">
                      <span>　</span>
                      <div className="absolute inset-y-0 left-1/2 w-px bg-blue-700" />
                    </div>
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    税率(%)
                  </div>
                  <div className="py-0.5 print:py-0.5">摘要</div>
                </div>

                {/* 仕切り: ヘッダ下の水平線 */}
                <div className="col-span-8 h-px bg-blue-700" />
              </div>

              {/* データ行（1〜12） */}
              <div className="divide-y divide-blue-700">
                {rows.map((n) => (
                  <div
                    key={n}
                    className="grid grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] print:grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] min-h-[14px] print:min-h-[11px]"
                  >
                    <div className="border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                      {n}
                    </div>
                    <div className="border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                      {n <= 3 &&
                        siteNames &&
                        siteNames[n - 1] &&
                        siteNames[n - 1]}
                    </div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    {/* 金額（税抜） */}
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    {/* 金額（税込） */}
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    <div className="py-1 px-2"></div>
                  </div>
                ))}
              </div>

              {/* フッター集計行 */}
              <div className="grid grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] print:grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] border-t border-blue-700">
                <div className="col-span-2 border-r border-blue-700 py-1 print:py-1 px-1 print:px-1">
                  合計（税抜・税込）
                </div>

                {/* 空白（数量・単価） */}
                <div className="border-r border-blue-700" />
                <div className="border-r border-blue-700" />

                {/* 金額（税抜）合計 */}
                <div className="border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 text-right tabular-nums"></div>
                {/* 金額（税込）合計 */}
                <div className="border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 text-right tabular-nums"></div>

                {/* 右下の税率・消費税額等ボックス（2段） */}
                <div className="col-span-2">
                  <div className="grid grid-cols-[40px_1fr] print:grid-cols-[40px_1fr]">
                    {/* 1段目 */}
                    <div className="border-r border-b border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                      税率
                    </div>
                    <div className="border-b border-blue-700 grid grid-cols-[1fr_20px] print:grid-cols-[1fr_20px]">
                      <div className="py-1 px-2 text-right tabular-nums"></div>
                      <div className="py-1 px-2 text-right">%</div>
                    </div>
                    {/* 右肩ラベル */}
                    <div className="col-span-2 border-b border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1 text-right">
                      消費税額等
                    </div>

                    {/* 2段目 */}
                    <div className="border-r border-b border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                      税率
                    </div>
                    <div className="border-b border-blue-700 grid grid-cols-[1fr_20px] print:grid-cols-[1fr_20px]">
                      <div className="py-1 px-2 text-right tabular-nums"></div>
                      <div className="py-1 px-2 text-right">%</div>
                    </div>
                    {/* 右肩ラベル */}
                    <div className="col-span-2 py-0.5 print:py-0.5 px-1 print:px-1 text-right">
                      消費税額等
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2枚目の請求書 */}
          <section
            className="pt-10
            bg-white shadow
            w-[148.5mm] h-[210mm] p-[2.5mm] mx-0
            print:shadow-none print:w-[148.5mm] print:h-[210mm] print:p-[2.5mm] print:mx-0
            text-[8px] print:text-[8px] leading-tight
            font-[system-ui]
          "
          >
            {/* ヘッダー行 */}
            <header className="relative">
              <div className="flex items-start justify-between">
                <div className="text-[12px] print:text-[12px] tracking-wide font-medium text-blue-800">
                  請 求 書
                </div>

                <div className="flex items-center gap-1 print:gap-1 text-blue-900 text-[7px] print:text-[7px]">
                  {formattedDate && (
                    <span className="mr-2 print:mr-1">{formattedDate}</span>
                  )}
                  <span>年</span>
                  <span className="inline-block w-4 print:w-4 border-b border-blue-700" />
                  <span>月</span>
                  <span className="inline-block w-4 print:w-4 border-b border-blue-700" />
                  <span>日</span>
                  <span className="inline-block w-4 print:w-4 border-b border-blue-700" />
                  <span className="ml-2 print:ml-1">No.</span>
                  <span className="inline-block w-12 print:w-12 border-b border-blue-700" />
                </div>
              </div>
            </header>

            {/* 宛名・文言行 */}
            <div className="mt-1.5 print:mt-1">
              <div className="flex items-center justify-between">
                <div className="text-[10px] print:text-[10px] text-blue-900">
                  (株)LIFTING様
                </div>
              </div>
              <div className="mt-1 print:mt-0.5 flex items-start justify-between text-blue-900 text-[7px] print:text-[7px]">
                <div>下記のとおり御請求申し上げます</div>

                {/* スタッフ情報（右側） */}
                <div className="text-right space-y-0.5 print:space-y-0.5">
                  {staff.name && <div>氏名: {staff.name}</div>}
                  {staff.address && <div>住所: {staff.address}</div>}
                  {staff.phone && <div>電話番号: {staff.phone}</div>}

                  {/* 登録番号 */}
                  <div className="mt-1 print:mt-0.5 flex items-center justify-end gap-1.5 print:gap-1.5">
                    <span>登録番号</span>
                    <span className="inline-block w-[72px] print:w-[72px] border-b border-blue-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* メインテーブル */}
            <div className="mt-0.5 print:mt-0.25 border border-blue-700 text-blue-900">
              {/* テーブルヘッダ（2段構造の右肩に"消費税額等"） */}
              <div className="grid grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] print:grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr]">
                {/* 上段の右肩ラベル */}
                <div className="col-span-8 border-b border-blue-700">
                  <div className="inline-block px-1.5 print:px-1.5 py-0.5 print:py-0.5 text-blue-900">
                    税込合計金額
                    {amount && (
                      <span className="ml-2 print:ml-2 text-right tabular-nums">
                        ¥{amount}
                      </span>
                    )}
                  </div>
                  <div className="ml-auto w-[88px] print:w-[88px] pb-1 print:pb-1 border-l border-blue-700">
                    消費税額等
                  </div>
                </div>

                {/* 見出し行 */}
                <div className="contents text-center">
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    月日
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    品名
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    数量
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    単価
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    金額（税抜・税込）
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    {/* 金額（税抜・税込）を2分割にみせる縦仕切り */}
                    <div className="relative">
                      <span>　</span>
                      <div className="absolute inset-y-0 left-1/2 w-px bg-blue-700" />
                    </div>
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    税率(%)
                  </div>
                  <div className="py-0.5 print:py-0.5">摘要</div>
                </div>

                {/* 仕切り: ヘッダ下の水平線 */}
                <div className="col-span-8 h-px bg-blue-700" />
              </div>

              {/* データ行（1〜12） */}
              <div className="divide-y divide-blue-700">
                {rows.map((n) => (
                  <div
                    key={n}
                    className="grid grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] print:grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] min-h-[14px] print:min-h-[11px]"
                  >
                    <div className="border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                      {n}
                    </div>
                    <div className="border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                      {n <= 3 &&
                        siteNames &&
                        siteNames[n - 1] &&
                        siteNames[n - 1]}
                    </div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    {/* 金額（税抜） */}
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    {/* 金額（税込） */}
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    <div className="py-1 px-2"></div>
                  </div>
                ))}
              </div>

              {/* フッター集計行 */}
              <div className="grid grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] print:grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] border-t border-blue-700">
                <div className="col-span-2 border-r border-blue-700 py-1 print:py-1 px-1 print:px-1">
                  合計（税抜・税込）
                </div>

                {/* 空白（数量・単価） */}
                <div className="border-r border-blue-700" />
                <div className="border-r border-blue-700" />

                {/* 金額（税抜）合計 */}
                <div className="border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 text-right tabular-nums"></div>
                {/* 金額（税込）合計 */}
                <div className="border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 text-right tabular-nums"></div>

                {/* 右下の税率・消費税額等ボックス（2段） */}
                <div className="col-span-2">
                  <div className="grid grid-cols-[40px_1fr] print:grid-cols-[40px_1fr]">
                    {/* 1段目 */}
                    <div className="border-r border-b border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                      税率
                    </div>
                    <div className="border-b border-blue-700 grid grid-cols-[1fr_20px] print:grid-cols-[1fr_20px]">
                      <div className="py-1 px-2 text-right tabular-nums"></div>
                      <div className="py-1 px-2 text-right">%</div>
                    </div>
                    {/* 右肩ラベル */}
                    <div className="col-span-2 border-b border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1 text-right">
                      消費税額等
                    </div>

                    {/* 2段目 */}
                    <div className="border-r border-b border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                      税率
                    </div>
                    <div className="border-b border-blue-700 grid grid-cols-[1fr_20px] print:grid-cols-[1fr_20px]">
                      <div className="py-1 px-2 text-right tabular-nums"></div>
                      <div className="py-1 px-2 text-right">%</div>
                    </div>
                    {/* 右肩ラベル */}
                    <div className="col-span-2 py-0.5 print:py-0.5 px-1 print:px-1 text-right">
                      消費税額等
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 印刷専用の請求書コンテナ（プレビュー時は非表示） */}
      <div className="hidden print:flex print:w-[297mm] print:h-[210mm] print:flex-row print:gap-0 print:items-center print:justify-center">
        {/* 1枚目の請求書 */}
        <section
          className="pt-10
            bg-white
            w-[148.5mm] h-[210mm] p-[2.5mm] mx-0
            print:shadow-none print:w-[148.5mm] print:h-[210mm] print:p-[2.5mm] print:mx-0
            text-[8px] print:text-[8px] leading-tight
            font-[system-ui]
          "
        >
          {/* ヘッダー行 */}
          <header className="relative">
            <div className="flex items-start justify-between">
              <div className="text-[12px] print:text-[12px] tracking-wide font-medium text-blue-800">
                請 求 書（控）
              </div>

              <div className="flex items-center gap-1 print:gap-1 text-blue-900 text-[7px] print:text-[7px]">
                {formattedDate && (
                  <span className="mr-2 print:mr-1">{formattedDate}</span>
                )}
                <span>年</span>
                <span className="inline-block w-4 print:w-4 border-b border-blue-700" />
                <span>月</span>
                <span className="inline-block w-4 print:w-4 border-b border-blue-700" />
                <span>日</span>
                <span className="inline-block w-4 print:w-4 border-b border-blue-700" />
                <span className="ml-2 print:ml-1">No.</span>
                <span className="inline-block w-12 print:w-12 border-b border-blue-700" />
              </div>
            </div>
          </header>

          {/* 宛名・文言行 */}
          <div className="mt-1.5 print:mt-1">
            <div className="flex items-center justify-between">
              <div className="text-[10px] print:text-[10px] text-blue-900">
                (株)LIFTING様
              </div>
            </div>
            <div className="mt-1 print:mt-0.5 flex items-start justify-between text-blue-900 text-[7px] print:text-[7px]">
              <div>下記のとおり御請求申し上げます</div>

              {/* スタッフ情報（右側） */}
              <div className="text-right space-y-0.5 print:space-y-0.5">
                {staff.name && <div>氏名: {staff.name}</div>}
                {staff.address && <div>住所: {staff.address}</div>}
                {staff.phone && <div>電話番号: {staff.phone}</div>}

                {/* 登録番号 */}
                <div className="mt-1 print:mt-0.5 flex items-center justify-end gap-1.5 print:gap-1.5">
                  <span>登録番号</span>
                  <span className="inline-block w-[72px] print:w-[72px] border-b border-blue-700" />
                </div>
              </div>
            </div>
          </div>

          {/* メインテーブル */}
          <div className="mt-0.5 print:mt-0.25 border border-blue-700 text-blue-900">
            {/* テーブルヘッダ（2段構造の右肩に"消費税額等"） */}
            <div className="grid grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] print:grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr]">
              {/* 上段の右肩ラベル */}
              <div className="col-span-8 border-b border-blue-700">
                <div className="inline-block px-1.5 print:px-1.5 py-0.5 print:py-0.5 text-blue-900">
                  税込合計金額
                  {amount && (
                    <span className="ml-2 print:ml-2 text-right tabular-nums">
                      ¥{amount}
                    </span>
                  )}
                </div>
                <div className="ml-auto w-[88px] print:w-[88px] pb-1 print:pb-1 border-l border-blue-700">
                  消費税額等
                </div>
              </div>

              {/* 見出し行 */}
              <div className="contents text-center">
                <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                  月日
                </div>
                <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                  品名
                </div>
                <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                  数量
                </div>
                <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                  単価
                </div>
                <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                  金額（税抜・税込）
                </div>
                <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                  {/* 金額（税抜・税込）を2分割にみせる縦仕切り */}
                  <div className="relative">
                    <span>　</span>
                    <div className="absolute inset-y-0 left-1/2 w-px bg-blue-700" />
                  </div>
                </div>
                <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                  税率(%)
                </div>
                <div className="py-0.5 print:py-0.5">摘要</div>
              </div>

              {/* 仕切り: ヘッダ下の水平線 */}
              <div className="col-span-8 h-px bg-blue-700" />
            </div>

            {/* データ行（1〜12） */}
            <div className="divide-y divide-blue-700">
              {rows.map((n) => (
                <div
                  key={n}
                  className="grid grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] print:grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] min-h-[14px] print:min-h-[11px]"
                >
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                    {n}
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                    {n <= 3 &&
                      siteNames &&
                      siteNames[n - 1] &&
                      siteNames[n - 1]}
                  </div>
                  <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                  <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                  {/* 金額（税抜） */}
                  <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                  {/* 金額（税込） */}
                  <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                  <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                  <div className="py-1 px-2"></div>
                </div>
              ))}
            </div>

            {/* フッター集計行 */}
            <div className="grid grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] print:grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] border-t border-blue-700">
              <div className="col-span-2 border-r border-blue-700 py-1 print:py-1 px-1 print:px-1">
                合計（税抜・税込）
              </div>

              {/* 空白（数量・単価） */}
              <div className="border-r border-blue-700" />
              <div className="border-r border-blue-700" />

              {/* 金額（税抜）合計 */}
              <div className="border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 text-right tabular-nums"></div>
              {/* 金額（税込）合計 */}
              <div className="border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 text-right tabular-nums"></div>

              {/* 右下の税率・消費税額等ボックス（2段） */}
              <div className="col-span-2">
                <div className="grid grid-cols-[40px_1fr] print:grid-cols-[40px_1fr]">
                  {/* 1段目 */}
                  <div className="border-r border-b border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                    税率
                  </div>
                  <div className="border-b border-blue-700 grid grid-cols-[1fr_20px] print:grid-cols-[1fr_20px]">
                    <div className="py-1 px-2 text-right tabular-nums"></div>
                    <div className="py-1 px-2 text-right">%</div>
                  </div>
                  {/* 右肩ラベル */}
                  <div className="col-span-2 border-b border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1 text-right">
                    消費税額等
                  </div>

                  {/* 2段目 */}
                  <div className="border-r border-b border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                    税率
                  </div>
                  <div className="border-b border-blue-700 grid grid-cols-[1fr_20px] print:grid-cols-[1fr_20px]">
                    <div className="py-1 px-2 text-right tabular-nums"></div>
                    <div className="py-1 px-2 text-right">%</div>
                  </div>
                  {/* 右肩ラベル */}
                  <div className="col-span-2 py-0.5 print:py-0.5 px-1 print:px-1 text-right">
                    消費税額等
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2枚目の請求書 */}
        <section
          className="pt-10
            bg-white
            w-[148.5mm] h-[210mm] p-[2.5mm] mx-0
            print:shadow-none print:w-[148.5mm] print:h-[210mm] print:p-[2.5mm] print:mx-0
            text-[8px] print:text-[8px] leading-tight
            font-[system-ui]
          "
        >
          {/* ヘッダー行 */}
          <header className="relative">
            <div className="flex items-start justify-between">
              <div className="text-[12px] print:text-[12px] tracking-wide font-medium text-blue-800">
                請 求 書
              </div>

              <div className="flex items-center gap-1 print:gap-1 text-blue-900 text-[7px] print:text-[7px]">
                {formattedDate && (
                  <span className="mr-2 print:mr-1">{formattedDate}</span>
                )}
                <span>年</span>
                <span className="inline-block w-4 print:w-4 border-b border-blue-700" />
                <span>月</span>
                <span className="inline-block w-4 print:w-4 border-b border-blue-700" />
                <span>日</span>
                <span className="inline-block w-4 print:w-4 border-b border-blue-700" />
                <span className="ml-2 print:ml-1">No.</span>
                <span className="inline-block w-12 print:w-12 border-b border-blue-700" />
              </div>
            </div>
          </header>

          {/* 宛名・文言行 */}
          <div className="mt-1.5 print:mt-1">
            <div className="flex items-center justify-between">
              <div className="text-[10px] print:text-[10px] text-blue-900">
                (株)LIFTING様
              </div>
            </div>
            <div className="mt-1 print:mt-0.5 flex items-start justify-between text-blue-900 text-[7px] print:text-[7px]">
              <div>下記のとおり御請求申し上げます</div>

              {/* スタッフ情報（右側） */}
              <div className="text-right space-y-0.5 print:space-y-0.5">
                {staff.name && <div>氏名: {staff.name}</div>}
                {staff.address && <div>住所: {staff.address}</div>}
                {staff.phone && <div>電話番号: {staff.phone}</div>}

                {/* 登録番号 */}
                <div className="mt-1 print:mt-0.5 flex items-center justify-end gap-1.5 print:gap-1.5">
                  <span>登録番号</span>
                  <span className="inline-block w-[72px] print:w-[72px] border-b border-blue-700" />
                </div>
              </div>
            </div>
          </div>

          {/* メインテーブル */}
          <div className="mt-0.5 print:mt-0.25 border border-blue-700 text-blue-900">
            {/* テーブルヘッダ（2段構造の右肩に"消費税額等"） */}
            <div className="grid grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] print:grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr]">
              {/* 上段の右肩ラベル */}
              <div className="col-span-8 border-b border-blue-700">
                <div className="inline-block px-1.5 print:px-1.5 py-0.5 print:py-0.5 text-blue-900">
                  税込合計金額
                  {amount && (
                    <span className="ml-2 print:ml-2 text-right tabular-nums">
                      ¥{amount}
                    </span>
                  )}
                </div>
                <div className="ml-auto w-[88px] print:w-[88px] pb-1 print:pb-1 border-l border-blue-700">
                  消費税額等
                </div>
              </div>

              {/* 見出し行 */}
              <div className="contents text-center">
                <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                  月日
                </div>
                <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                  品名
                </div>
                <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                  数量
                </div>
                <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                  単価
                </div>
                <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                  金額（税抜・税込）
                </div>
                <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                  {/* 金額（税抜・税込）を2分割にみせる縦仕切り */}
                  <div className="relative">
                    <span>　</span>
                    <div className="absolute inset-y-0 left-1/2 w-px bg-blue-700" />
                  </div>
                </div>
                <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                  税率(%)
                </div>
                <div className="py-0.5 print:py-0.5">摘要</div>
              </div>

              {/* 仕切り: ヘッダ下の水平線 */}
              <div className="col-span-8 h-px bg-blue-700" />
            </div>

            {/* データ行（1〜12） */}
            <div className="divide-y divide-blue-700">
              {rows.map((n) => (
                <div
                  key={n}
                  className="grid grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] print:grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] min-h-[14px] print:min-h-[11px]"
                >
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                    {n}
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                    {n <= 3 &&
                      siteNames &&
                      siteNames[n - 1] &&
                      siteNames[n - 1]}
                  </div>
                  <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                  <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                  {/* 金額（税抜） */}
                  <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                  {/* 金額（税込） */}
                  <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                  <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                  <div className="py-1 px-2"></div>
                </div>
              ))}
            </div>

            {/* フッター集計行 */}
            <div className="grid grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] print:grid-cols-[28px_1fr_42px_42px_55px_55px_40px_1fr] border-t border-blue-700">
              <div className="col-span-2 border-r border-blue-700 py-1 print:py-1 px-1 print:px-1">
                合計（税抜・税込）
              </div>

              {/* 空白（数量・単価） */}
              <div className="border-r border-blue-700" />
              <div className="border-r border-blue-700" />

              {/* 金額（税抜）合計 */}
              <div className="border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 text-right tabular-nums"></div>
              {/* 金額（税込）合計 */}
              <div className="border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 text-right tabular-nums"></div>

              {/* 右下の税率・消費税額等ボックス（2段） */}
              <div className="col-span-2">
                <div className="grid grid-cols-[40px_1fr] print:grid-cols-[40px_1fr]">
                  {/* 1段目 */}
                  <div className="border-r border-b border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                    税率
                  </div>
                  <div className="border-b border-blue-700 grid grid-cols-[1fr_20px] print:grid-cols-[1fr_20px]">
                    <div className="py-1 px-2 text-right tabular-nums"></div>
                    <div className="py-1 px-2 text-right">%</div>
                  </div>
                  {/* 右肩ラベル */}
                  <div className="col-span-2 border-b border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1 text-right">
                    消費税額等
                  </div>

                  {/* 2段目 */}
                  <div className="border-r border-b border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1">
                    税率
                  </div>
                  <div className="border-b border-blue-700 grid grid-cols-[1fr_20px] print:grid-cols-[1fr_20px]">
                    <div className="py-1 px-2 text-right tabular-nums"></div>
                    <div className="py-1 px-2 text-right">%</div>
                  </div>
                  {/* 右肩ラベル */}
                  <div className="col-span-2 py-0.5 print:py-0.5 px-1 print:px-1 text-right">
                    消費税額等
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 印刷余白調整 */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        /* 罫線カラーを画像に寄せて青系に */
        .border-blue-700 { border-color: #1e40af !important; }
        .text-blue-900 { color: #1e3a8a !important; }
        .text-blue-800 { color: #1e40af !important; }
        .bg-blue-700 { background-color: #1e40af !important; }
        .tabular-nums { font-variant-numeric: tabular-nums; }
      `}</style>
    </>
  );
}
