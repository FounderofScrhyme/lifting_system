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
        {/* 2枚の請求書コンテナ（A4縦向き、縦並び） */}
        <div className="w-[190mm] h-[297mm] flex flex-col gap-0 items-center justify-center">
          {/* 1枚目の請求書 */}
          <section
            className=" pt-10
            bg-white shadow
            w-[190mm] h-[155mm] p-[2.5mm] mx-0
            print:shadow-none print:w-[190mm] print:h-[155mm] print:p-[2.5mm] print:mx-0 print:ml-0
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
                  <span className="ml-2 print:ml-1">No.</span>
                  <span className="inline-block w-12 print:w-12 border-b border-blue-700" />
                </div>
              </div>
            </header>

            {/* 宛名・文言行 */}
            <div className="mt-8 print:mt-1">
              <div className="flex items-center justify-between">
                <div className="text-[10px] print:text-[10px] text-blue-900">
                  (株)LIFTING様
                </div>
                {/* スタッフ情報（右側） */}
                <div className="text-left space-y-0.5 print:space-y-0.5 text-blue-900 text-[7px] print:text-[7px]">
                  {staff.name && <div>氏名: {staff.name}</div>}
                  {staff.address && <div>住所: {staff.address}</div>}
                  {staff.phone && <div>電話番号: {staff.phone}</div>}
                </div>
              </div>
              <div className="mt-1 print:mt-0.5 flex items-start justify-between text-blue-900 text-[7px] print:text-[7px]">
                <div>下記のとおり御請求申し上げます</div>

                {/* 登録番号 */}
                <div className="mt-2 print:mt-1.5 flex items-center justify-end gap-1.5 print:gap-1.5">
                  <span>登録番号</span>
                  <span className="inline-block w-[72px] print:w-[72px] border-b border-blue-700" />
                </div>
              </div>
            </div>

            {/* メインテーブル */}
            <div className="mt-0.5 print:mt-0.25 border border-blue-700 text-blue-900">
              {/* テーブルヘッダ（2段構造の右肩に"消費税額等"） */}
              <div className="grid grid-cols-[40px_1fr_42px_42px_110px_40px_0.25fr] print:grid-cols-[40px_1fr_42px_42px_110px_40px_0.25fr]">
                {/* 上段の右肩ラベル */}
                <div className="col-span-7 border-b border-blue-700 relative">
                  <div className="flex items-center justify-between py-2 print:py-2 text-blue-900">
                    <span className="text-[14px] print:text-[14px] font-semibold pl-2 print:pl-2">
                      税込合計金額
                    </span>
                    {amount && (
                      <span className="absolute left-1/2 transform -translate-x-1/2 text-[16px] print:text-[16px] font-bold tabular-nums">
                        ¥{amount}-
                      </span>
                    )}
                  </div>
                  <div className="absolute top-0 right-[1px] bottom-[1px] w-[176px] print:w-[176px] border-l border-blue-700 text-[7px] print:text-[7px] text-left pl-1 print:pl-1 pt-0.5 print:pt-0.5 flex flex-col">
                    <div>消費税額等</div>
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-[12px] print:text-[12px] font-semibold">
                        10%
                      </span>
                    </div>
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
                    金額（税抜・
                    <span className="inline-flex items-center justify-center rounded-full border border-blue-700 px-0.5 print:px-0.5">
                      税込
                    </span>
                    ）
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    税率(%)
                  </div>
                  <div className="py-0.5 print:py-0.5">摘要</div>
                </div>

                {/* 仕切り: ヘッダ下の水平線 */}
                <div className="col-span-7 h-px bg-blue-700" />
              </div>

              {/* データ行（1〜12） */}
              <div className="divide-y divide-blue-700">
                {rows.map((n) => (
                  <div
                    key={n}
                    className={`grid grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] print:grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] min-h-[14px] print:min-h-[11px] ${
                      n === 12 ? "border-b-0" : ""
                    }`}
                  >
                    {/* 月 */}
                    <div
                      className={`border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1 ${
                        n === 12 ? "border-b-0" : ""
                      }`}
                    ></div>
                    {/* 日 */}
                    <div
                      className={`border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1 ${
                        n === 12 ? "border-b-0" : ""
                      }`}
                    ></div>
                    {/* 品名（連番と現場名を横一列に表示、現場名は中央） */}
                    <div
                      className={`border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 flex items-center justify-center gap-1 print:gap-1 relative min-h-[18px] print:min-h-[16px] ${
                        n === 12 ? "border-b-0" : ""
                      }`}
                    >
                      <span className="absolute left-1 print:left-1 text-[8px] print:text-[8px]">
                        {n}
                      </span>
                      <span className="text-[10px] print:text-[10px]">
                        {n <= 3 &&
                          siteNames &&
                          siteNames[n - 1] &&
                          siteNames[n - 1]}
                      </span>
                    </div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    {/* 金額（税抜・税込） */}
                    <div className="border-r border-blue-700 py-1 px-2 text-center tabular-nums flex items-center justify-center">
                      {n === 1 && amount && (
                        <span className="text-[11px] print:text-[11px] font-semibold">
                          ¥{amount}
                        </span>
                      )}
                    </div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    <div className="py-1 px-2"></div>
                  </div>
                ))}
              </div>

              {/* フッター集計行 */}
              <div className="grid grid-rows-2 grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] print:grid-rows-2 print:grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] border-t border-blue-700">
                {/* 1行目 */}
                {/* 空白（月・日） */}
                <div className="border-r border-blue-700" />
                <div className="border-r border-blue-700" />
                {/* 合計（税抜・税込） */}
                <div className="row-span-2 border-r border-blue-700 py-2 print:py-2 px-1 print:px-1 flex flex-col items-center justify-center">
                  <div className="text-[12px] print:text-[12px] font-semibold text-center">
                    合計（税抜・
                    <span className="inline-flex items-center justify-center rounded-full border border-blue-700 px-0.5 print:px-0.5">
                      税込
                    </span>
                    ）
                  </div>
                  <div className="text-right tabular-nums mt-1 print:mt-1"></div>
                </div>
                {/* 税率（左）- 数量と単価の位置に2分割 */}
                <div className="col-span-2 border-r border-b border-blue-700 py-1 print:py-1 px-1 print:px-1">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    税率
                  </div>
                  <div className="text-right tabular-nums"></div>
                </div>
                {/* 金額（税抜・税込）合計 */}
                <div className="row-span-2 border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 text-center tabular-nums flex items-center justify-center">
                  {amount && (
                    <span className="text-[11px] print:text-[11px] font-semibold">
                      ¥{amount}
                    </span>
                  )}
                </div>
                {/* 消費税額等（左）- 税率と摘要の合計幅 */}
                <div className="col-span-2 border-r border-b border-blue-700 py-1 print:py-1 px-1 print:px-1">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    消費税額等
                  </div>
                  <div className="text-right tabular-nums"></div>
                </div>

                {/* 2行目 */}
                {/* 空白（月・日） */}
                <div className="border-r border-blue-700" />
                <div className="border-r border-blue-700" />
                {/* 税率（右）- 数量と単価の位置に2分割 */}
                <div className="col-span-2 border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 flex flex-col">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    税率
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-[12px] print:text-[12px] font-semibold tabular-nums">
                      10%
                    </span>
                  </div>
                </div>
                {/* 消費税額等（右）- 税率と摘要の合計幅 */}
                <div className="col-span-2 py-1 print:py-1 px-1 print:px-1">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    消費税額等
                  </div>
                  <div className="text-right tabular-nums"></div>
                </div>
              </div>
            </div>
          </section>

          {/* 2枚目の請求書 */}
          <section
            className="pt-10
            bg-white shadow
            w-[190mm] h-[155mm] p-[2.5mm] mx-0
            print:shadow-none print:w-[190mm] print:h-[155mm] print:p-[2.5mm] print:mx-0 print:ml-0
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
                  <span className="ml-2 print:ml-1">No.</span>
                  <span className="inline-block w-12 print:w-12 border-b border-blue-700" />
                </div>
              </div>
            </header>

            {/* 宛名・文言行 */}
            <div className="mt-8 print:mt-1">
              <div className="flex items-center justify-between">
                <div className="text-[10px] print:text-[10px] text-blue-900">
                  (株)LIFTING様
                </div>
                {/* スタッフ情報（右側） */}
                <div className="text-left space-y-0.5 print:space-y-0.5 text-blue-900 text-[7px] print:text-[7px]">
                  {staff.name && <div>氏名: {staff.name}</div>}
                  {staff.address && <div>住所: {staff.address}</div>}
                  {staff.phone && <div>電話番号: {staff.phone}</div>}
                </div>
              </div>
              <div className="mt-1 print:mt-0.5 flex items-start justify-between text-blue-900 text-[7px] print:text-[7px]">
                <div>下記のとおり御請求申し上げます</div>

                {/* 登録番号 */}
                <div className="mt-2 print:mt-1.5 flex items-center justify-end gap-1.5 print:gap-1.5">
                  <span>登録番号</span>
                  <span className="inline-block w-[72px] print:w-[72px] border-b border-blue-700" />
                </div>
              </div>
            </div>

            {/* メインテーブル */}
            <div className="mt-0.5 print:mt-0.25 border border-blue-700 text-blue-900">
              {/* テーブルヘッダ（2段構造の右肩に"消費税額等"） */}
              <div className="grid grid-cols-[40px_1fr_42px_42px_110px_40px_0.25fr] print:grid-cols-[40px_1fr_42px_42px_110px_40px_0.25fr]">
                {/* 上段の右肩ラベル */}
                <div className="col-span-7 border-b border-blue-700 relative">
                  <div className="flex items-center justify-between py-2 print:py-2 text-blue-900">
                    <span className="text-[14px] print:text-[14px] font-semibold pl-2 print:pl-2">
                      税込合計金額
                    </span>
                    {amount && (
                      <span className="absolute left-1/2 transform -translate-x-1/2 text-[16px] print:text-[16px] font-bold tabular-nums">
                        ¥{amount}-
                      </span>
                    )}
                  </div>
                  <div className="absolute top-0 right-[1px] bottom-[1px] w-[176px] print:w-[176px] border-l border-blue-700 text-[7px] print:text-[7px] text-left pl-1 print:pl-1 pt-0.5 print:pt-0.5 flex flex-col">
                    <div>消費税額等</div>
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-[12px] print:text-[12px] font-semibold">
                        10%
                      </span>
                    </div>
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
                    金額（税抜・
                    <span className="inline-flex items-center justify-center rounded-full border border-blue-700 px-0.5 print:px-0.5">
                      税込
                    </span>
                    ）
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    税率(%)
                  </div>
                  <div className="py-0.5 print:py-0.5">摘要</div>
                </div>

                {/* 仕切り: ヘッダ下の水平線 */}
                <div className="col-span-7 h-px bg-blue-700" />
              </div>

              {/* データ行（1〜12） */}
              <div className="divide-y divide-blue-700">
                {rows.map((n) => (
                  <div
                    key={n}
                    className={`grid grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] print:grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] min-h-[14px] print:min-h-[11px] ${
                      n === 12 ? "border-b-0" : ""
                    }`}
                  >
                    {/* 月 */}
                    <div
                      className={`border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1 ${
                        n === 12 ? "border-b-0" : ""
                      }`}
                    ></div>
                    {/* 日 */}
                    <div
                      className={`border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1 ${
                        n === 12 ? "border-b-0" : ""
                      }`}
                    ></div>
                    {/* 品名（連番と現場名を横一列に表示、現場名は中央） */}
                    <div
                      className={`border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 flex items-center justify-center gap-1 print:gap-1 relative min-h-[18px] print:min-h-[16px] ${
                        n === 12 ? "border-b-0" : ""
                      }`}
                    >
                      <span className="absolute left-1 print:left-1 text-[8px] print:text-[8px]">
                        {n}
                      </span>
                      <span className="text-[10px] print:text-[10px]">
                        {n <= 3 &&
                          siteNames &&
                          siteNames[n - 1] &&
                          siteNames[n - 1]}
                      </span>
                    </div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    {/* 金額（税抜・税込） */}
                    <div className="border-r border-blue-700 py-1 px-2 text-center tabular-nums flex items-center justify-center">
                      {n === 1 && amount && (
                        <span className="text-[11px] print:text-[11px] font-semibold">
                          ¥{amount}
                        </span>
                      )}
                    </div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    <div className="py-1 px-2"></div>
                  </div>
                ))}
              </div>

              {/* フッター集計行 */}
              <div className="grid grid-rows-2 grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] print:grid-rows-2 print:grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] border-t border-blue-700">
                {/* 1行目 */}
                {/* 空白（月・日） */}
                <div className="border-r border-blue-700" />
                <div className="border-r border-blue-700" />
                {/* 合計（税抜・税込） */}
                <div className="row-span-2 border-r border-blue-700 py-2 print:py-2 px-1 print:px-1 flex flex-col items-center justify-center">
                  <div className="text-[12px] print:text-[12px] font-semibold text-center">
                    合計（税抜・
                    <span className="inline-flex items-center justify-center rounded-full border border-blue-700 px-0.5 print:px-0.5">
                      税込
                    </span>
                    ）
                  </div>
                  <div className="text-right tabular-nums mt-1 print:mt-1"></div>
                </div>
                {/* 税率（左）- 数量と単価の位置に2分割 */}
                <div className="col-span-2 border-r border-b border-blue-700 py-1 print:py-1 px-1 print:px-1">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    税率
                  </div>
                  <div className="text-right tabular-nums"></div>
                </div>
                {/* 金額（税抜・税込）合計 */}
                <div className="row-span-2 border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 text-center tabular-nums flex items-center justify-center">
                  {amount && (
                    <span className="text-[11px] print:text-[11px] font-semibold">
                      ¥{amount}
                    </span>
                  )}
                </div>
                {/* 消費税額等（左）- 税率と摘要の合計幅 */}
                <div className="col-span-2 border-r border-b border-blue-700 py-1 print:py-1 px-1 print:px-1">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    消費税額等
                  </div>
                  <div className="text-right tabular-nums"></div>
                </div>

                {/* 2行目 */}
                {/* 空白（月・日） */}
                <div className="border-r border-blue-700" />
                <div className="border-r border-blue-700" />
                {/* 税率（右）- 数量と単価の位置に2分割 */}
                <div className="col-span-2 border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 flex flex-col">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    税率
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-[12px] print:text-[12px] font-semibold tabular-nums">
                      10%
                    </span>
                  </div>
                </div>
                {/* 消費税額等（右）- 税率と摘要の合計幅 */}
                <div className="col-span-2 py-1 print:py-1 px-1 print:px-1">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    消費税額等
                  </div>
                  <div className="text-right tabular-nums"></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 印刷専用の請求書コンテナ（プレビュー時は非表示） */}
      <div className="hidden print:block print-invoice-container">
        <div className="print:flex print:flex-col print:gap-0 print:items-start print:justify-start print:w-[190mm] print:h-[297mm] print:m-0 print:p-0">
          {/* 1枚目の請求書 */}
          <section
            className="pt-10
            bg-white
            w-[190mm] h-[155mm] p-[2.5mm] mx-0
            print:shadow-none print:w-[190mm] print:h-[155mm] print:p-[2.5mm] print:mx-0 print:ml-0
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
                  <span className="ml-2 print:ml-1">No.</span>
                  <span className="inline-block w-12 print:w-12 border-b border-blue-700" />
                </div>
              </div>
            </header>

            {/* 宛名・文言行 */}
            <div className="mt-8 print:mt-1">
              <div className="flex items-center justify-between">
                <div className="text-[10px] print:text-[10px] text-blue-900">
                  (株)LIFTING様
                </div>
                {/* スタッフ情報（右側） */}
                <div className="text-left space-y-0.5 print:space-y-0.5 text-blue-900 text-[7px] print:text-[7px]">
                  {staff.name && <div>氏名: {staff.name}</div>}
                  {staff.address && <div>住所: {staff.address}</div>}
                  {staff.phone && <div>電話番号: {staff.phone}</div>}
                </div>
              </div>
              <div className="mt-1 print:mt-0.5 flex items-start justify-between text-blue-900 text-[7px] print:text-[7px]">
                <div>下記のとおり御請求申し上げます</div>

                {/* 登録番号 */}
                <div className="mt-2 print:mt-1.5 flex items-center justify-end gap-1.5 print:gap-1.5">
                  <span>登録番号</span>
                  <span className="inline-block w-[72px] print:w-[72px] border-b border-blue-700" />
                </div>
              </div>
            </div>

            {/* メインテーブル */}
            <div className="mt-0.5 print:mt-0.25 border border-blue-700 text-blue-900">
              {/* テーブルヘッダ（2段構造の右肩に"消費税額等"） */}
              <div className="grid grid-cols-[40px_1fr_42px_42px_110px_40px_0.25fr] print:grid-cols-[40px_1fr_42px_42px_110px_40px_0.25fr]">
                {/* 上段の右肩ラベル */}
                <div className="col-span-7 border-b border-blue-700 relative">
                  <div className="flex items-center justify-between py-2 print:py-2 text-blue-900">
                    <span className="text-[14px] print:text-[14px] font-semibold pl-2 print:pl-2">
                      税込合計金額
                    </span>
                    {amount && (
                      <span className="absolute left-1/2 transform -translate-x-1/2 text-[16px] print:text-[16px] font-bold tabular-nums">
                        ¥{amount}-
                      </span>
                    )}
                  </div>
                  <div className="absolute top-0 right-[1px] bottom-[1px] w-[176px] print:w-[176px] border-l border-blue-700 text-[7px] print:text-[7px] text-left pl-1 print:pl-1 pt-0.5 print:pt-0.5 flex flex-col">
                    <div>消費税額等</div>
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-[12px] print:text-[12px] font-semibold">
                        10%
                      </span>
                    </div>
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
                    金額（税抜・
                    <span className="inline-flex items-center justify-center rounded-full border border-blue-700 px-0.5 print:px-0.5">
                      税込
                    </span>
                    ）
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    税率(%)
                  </div>
                  <div className="py-0.5 print:py-0.5">摘要</div>
                </div>

                {/* 仕切り: ヘッダ下の水平線 */}
                <div className="col-span-7 h-px bg-blue-700" />
              </div>

              {/* データ行（1〜12） */}
              <div className="divide-y divide-blue-700">
                {rows.map((n) => (
                  <div
                    key={n}
                    className={`grid grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] print:grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] min-h-[14px] print:min-h-[11px] ${
                      n === 12 ? "border-b-0" : ""
                    }`}
                  >
                    {/* 月 */}
                    <div
                      className={`border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1 ${
                        n === 12 ? "border-b-0" : ""
                      }`}
                    ></div>
                    {/* 日 */}
                    <div
                      className={`border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1 ${
                        n === 12 ? "border-b-0" : ""
                      }`}
                    ></div>
                    {/* 品名（連番と現場名を横一列に表示、現場名は中央） */}
                    <div
                      className={`border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 flex items-center justify-center gap-1 print:gap-1 relative min-h-[18px] print:min-h-[16px] ${
                        n === 12 ? "border-b-0" : ""
                      }`}
                    >
                      <span className="absolute left-1 print:left-1 text-[8px] print:text-[8px]">
                        {n}
                      </span>
                      <span className="text-[10px] print:text-[10px]">
                        {n <= 3 &&
                          siteNames &&
                          siteNames[n - 1] &&
                          siteNames[n - 1]}
                      </span>
                    </div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    {/* 金額（税抜・税込） */}
                    <div className="border-r border-blue-700 py-1 px-2 text-center tabular-nums flex items-center justify-center">
                      {n === 1 && amount && (
                        <span className="text-[11px] print:text-[11px] font-semibold">
                          ¥{amount}
                        </span>
                      )}
                    </div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    <div className="py-1 px-2"></div>
                  </div>
                ))}
              </div>

              {/* フッター集計行 */}
              <div className="grid grid-rows-2 grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] print:grid-rows-2 print:grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] border-t border-blue-700">
                {/* 1行目 */}
                {/* 空白（月・日） */}
                <div className="border-r border-blue-700" />
                <div className="border-r border-blue-700" />
                {/* 合計（税抜・税込） */}
                <div className="row-span-2 border-r border-blue-700 py-2 print:py-2 px-1 print:px-1 flex flex-col items-center justify-center">
                  <div className="text-[12px] print:text-[12px] font-semibold text-center">
                    合計（税抜・
                    <span className="inline-flex items-center justify-center rounded-full border border-blue-700 px-0.5 print:px-0.5">
                      税込
                    </span>
                    ）
                  </div>
                  <div className="text-right tabular-nums mt-1 print:mt-1"></div>
                </div>
                {/* 税率（左）- 数量と単価の位置に2分割 */}
                <div className="col-span-2 border-r border-b border-blue-700 py-1 print:py-1 px-1 print:px-1">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    税率
                  </div>
                  <div className="text-right tabular-nums"></div>
                </div>
                {/* 金額（税抜・税込）合計 */}
                <div className="row-span-2 border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 text-center tabular-nums flex items-center justify-center">
                  {amount && (
                    <span className="text-[11px] print:text-[11px] font-semibold">
                      ¥{amount}
                    </span>
                  )}
                </div>
                {/* 消費税額等（左）- 税率と摘要の合計幅 */}
                <div className="col-span-2 border-r border-b border-blue-700 py-1 print:py-1 px-1 print:px-1">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    消費税額等
                  </div>
                  <div className="text-right tabular-nums"></div>
                </div>

                {/* 2行目 */}
                {/* 空白（月・日） */}
                <div className="border-r border-blue-700" />
                <div className="border-r border-blue-700" />
                {/* 税率（右）- 数量と単価の位置に2分割 */}
                <div className="col-span-2 border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 flex flex-col">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    税率
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-[12px] print:text-[12px] font-semibold tabular-nums">
                      10%
                    </span>
                  </div>
                </div>
                {/* 消費税額等（右）- 税率と摘要の合計幅 */}
                <div className="col-span-2 py-1 print:py-1 px-1 print:px-1">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    消費税額等
                  </div>
                  <div className="text-right tabular-nums"></div>
                </div>
              </div>
            </div>
          </section>

          {/* 2枚目の請求書 */}
          <section
            className="pt-10
            bg-white
            w-[190mm] h-[155mm] p-[2.5mm] mx-0
            print:shadow-none print:w-[190mm] print:h-[155mm] print:p-[2.5mm] print:mx-0 print:ml-0
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
                  <span className="ml-2 print:ml-1">No.</span>
                  <span className="inline-block w-12 print:w-12 border-b border-blue-700" />
                </div>
              </div>
            </header>

            {/* 宛名・文言行 */}
            <div className="mt-8 print:mt-1">
              <div className="flex items-center justify-between">
                <div className="text-[10px] print:text-[10px] text-blue-900">
                  (株)LIFTING様
                </div>
                {/* スタッフ情報（右側） */}
                <div className="text-left space-y-0.5 print:space-y-0.5 text-blue-900 text-[7px] print:text-[7px]">
                  {staff.name && <div>氏名: {staff.name}</div>}
                  {staff.address && <div>住所: {staff.address}</div>}
                  {staff.phone && <div>電話番号: {staff.phone}</div>}
                </div>
              </div>
              <div className="mt-1 print:mt-0.5 flex items-start justify-between text-blue-900 text-[7px] print:text-[7px]">
                <div>下記のとおり御請求申し上げます</div>

                {/* 登録番号 */}
                <div className="mt-2 print:mt-1.5 flex items-center justify-end gap-1.5 print:gap-1.5">
                  <span>登録番号</span>
                  <span className="inline-block w-[72px] print:w-[72px] border-b border-blue-700" />
                </div>
              </div>
            </div>

            {/* メインテーブル */}
            <div className="mt-0.5 print:mt-0.25 border border-blue-700 text-blue-900">
              {/* テーブルヘッダ（2段構造の右肩に"消費税額等"） */}
              <div className="grid grid-cols-[40px_1fr_42px_42px_110px_40px_0.25fr] print:grid-cols-[40px_1fr_42px_42px_110px_40px_0.25fr]">
                {/* 上段の右肩ラベル */}
                <div className="col-span-7 border-b border-blue-700 relative">
                  <div className="flex items-center justify-between py-2 print:py-2 text-blue-900">
                    <span className="text-[14px] print:text-[14px] font-semibold pl-2 print:pl-2">
                      税込合計金額
                    </span>
                    {amount && (
                      <span className="absolute left-1/2 transform -translate-x-1/2 text-[16px] print:text-[16px] font-bold tabular-nums">
                        ¥{amount}-
                      </span>
                    )}
                  </div>
                  <div className="absolute top-0 right-[1px] bottom-[1px] w-[176px] print:w-[176px] border-l border-blue-700 text-[7px] print:text-[7px] text-left pl-1 print:pl-1 pt-0.5 print:pt-0.5 flex flex-col">
                    <div>消費税額等</div>
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-[12px] print:text-[12px] font-semibold">
                        10%
                      </span>
                    </div>
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
                    金額（税抜・
                    <span className="inline-flex items-center justify-center rounded-full border border-blue-700 px-0.5 print:px-0.5">
                      税込
                    </span>
                    ）
                  </div>
                  <div className="border-r border-blue-700 py-0.5 print:py-0.5">
                    税率(%)
                  </div>
                  <div className="py-0.5 print:py-0.5">摘要</div>
                </div>

                {/* 仕切り: ヘッダ下の水平線 */}
                <div className="col-span-7 h-px bg-blue-700" />
              </div>

              {/* データ行（1〜12） */}
              <div className="divide-y divide-blue-700">
                {rows.map((n) => (
                  <div
                    key={n}
                    className={`grid grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] print:grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] min-h-[14px] print:min-h-[11px] ${
                      n === 12 ? "border-b-0" : ""
                    }`}
                  >
                    {/* 月 */}
                    <div
                      className={`border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1 ${
                        n === 12 ? "border-b-0" : ""
                      }`}
                    ></div>
                    {/* 日 */}
                    <div
                      className={`border-r border-blue-700 py-0.5 print:py-0.5 px-1 print:px-1 ${
                        n === 12 ? "border-b-0" : ""
                      }`}
                    ></div>
                    {/* 品名（連番と現場名を横一列に表示、現場名は中央） */}
                    <div
                      className={`border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 flex items-center justify-center gap-1 print:gap-1 relative min-h-[18px] print:min-h-[16px] ${
                        n === 12 ? "border-b-0" : ""
                      }`}
                    >
                      <span className="absolute left-1 print:left-1 text-[8px] print:text-[8px]">
                        {n}
                      </span>
                      <span className="text-[10px] print:text-[10px]">
                        {n <= 3 &&
                          siteNames &&
                          siteNames[n - 1] &&
                          siteNames[n - 1]}
                      </span>
                    </div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    {/* 金額（税抜・税込） */}
                    <div className="border-r border-blue-700 py-1 px-2 text-center tabular-nums flex items-center justify-center">
                      {n === 1 && amount && (
                        <span className="text-[11px] print:text-[11px] font-semibold">
                          ¥{amount}
                        </span>
                      )}
                    </div>
                    <div className="border-r border-blue-700 py-1 px-2 text-right tabular-nums"></div>
                    <div className="py-1 px-2"></div>
                  </div>
                ))}
              </div>

              {/* フッター集計行 */}
              <div className="grid grid-rows-2 grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] print:grid-rows-2 print:grid-cols-[20px_20px_1fr_42px_42px_110px_40px_0.25fr] border-t border-blue-700">
                {/* 1行目 */}
                {/* 空白（月・日） */}
                <div className="border-r border-blue-700" />
                <div className="border-r border-blue-700" />
                {/* 合計（税抜・税込） */}
                <div className="row-span-2 border-r border-blue-700 py-2 print:py-2 px-1 print:px-1 flex flex-col items-center justify-center">
                  <div className="text-[12px] print:text-[12px] font-semibold text-center">
                    合計（税抜・
                    <span className="inline-flex items-center justify-center rounded-full border border-blue-700 px-0.5 print:px-0.5">
                      税込
                    </span>
                    ）
                  </div>
                  <div className="text-right tabular-nums mt-1 print:mt-1"></div>
                </div>
                {/* 税率（左）- 数量と単価の位置に2分割 */}
                <div className="col-span-2 border-r border-b border-blue-700 py-1 print:py-1 px-1 print:px-1">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    税率
                  </div>
                  <div className="text-right tabular-nums"></div>
                </div>
                {/* 金額（税抜・税込）合計 */}
                <div className="row-span-2 border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 text-center tabular-nums flex items-center justify-center">
                  {amount && (
                    <span className="text-[11px] print:text-[11px] font-semibold">
                      ¥{amount}
                    </span>
                  )}
                </div>
                {/* 消費税額等（左）- 税率と摘要の合計幅 */}
                <div className="col-span-2 border-r border-b border-blue-700 py-1 print:py-1 px-1 print:px-1">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    消費税額等
                  </div>
                  <div className="text-right tabular-nums"></div>
                </div>

                {/* 2行目 */}
                {/* 空白（月・日） */}
                <div className="border-r border-blue-700" />
                <div className="border-r border-blue-700" />
                {/* 税率（右）- 数量と単価の位置に2分割 */}
                <div className="col-span-2 border-r border-blue-700 py-1 print:py-1 px-1 print:px-1 flex flex-col">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    税率
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-[12px] print:text-[12px] font-semibold tabular-nums">
                      10%
                    </span>
                  </div>
                </div>
                {/* 消費税額等（右）- 税率と摘要の合計幅 */}
                <div className="col-span-2 py-1 print:py-1 px-1 print:px-1">
                  <div className="text-[7px] print:text-[7px] mb-0.5 print:mb-0.5">
                    消費税額等
                  </div>
                  <div className="text-right tabular-nums"></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 印刷余白調整 */}
      <style>{`
        @media print {
          @page { 
            size: A4 portrait; 
            margin: 0;
            padding: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body { 
            margin: 0 !important;
            padding: 0 !important;
          }
          /* 印刷コンテナを確実に表示（最優先） */
          .print-invoice-container {
            display: block !important;
            visibility: visible !important;
            position: fixed !important;
            top: 0 !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            z-index: 9999 !important;
            background: white !important;
          }
          /* すべての要素を非表示にしてから、印刷コンテナのみ表示 */
          body * {
            visibility: hidden !important;
          }
          .print-invoice-container,
          .print-invoice-container * {
            visibility: visible !important;
          }
          /* サイドバーやヘッダーなどのレイアウト要素を確実に非表示 */
          [data-sidebar],
          [data-slot="sidebar-container"],
          [data-slot="sidebar-inner"],
          .site-header,
          [class*="SidebarProvider"],
          [class*="SidebarInset"] {
            display: none !important;
            visibility: hidden !important;
          }
          /* 印刷コンテナのサイズとレイアウト設定 */
          .print-invoice-container {
            width: 190mm !important;
            max-width: 190mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
            overflow: visible !important;
          }
          .print-invoice-container > div {
            width: 190mm !important;
            max-width: 190mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
          }
          .print-invoice-container section {
            width: 190mm !important;
            max-width: 190mm !important;
            height: 155mm !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-inside: avoid !important;
          }
          /* 2枚目の請求書の前にページブレークを防ぐ */
          .print-invoice-container section:first-of-type {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .print-invoice-container section:last-of-type {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
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
