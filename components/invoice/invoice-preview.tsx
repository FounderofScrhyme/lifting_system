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
  return (
    <div className="min-h-screen bg-neutral-100 p-4 print:bg-white">
      <section className="mx-autobg-white shadow w-[210mm] h-[297mm] p-[10mm] print:shadow-none text-[10px] leading-tight font-[system-ui]">
        <header className="relative">
          <div className="flex items-center justify-between">
            <div className="text-[20px] trackiung-wide font-medium text-blue-800">
              請求書
            </div>

            <div className="flex justify-between gap-2 text-blue-800">
              <span>発行日: {issueDate}</span>
              <span>No.</span>
              <span className="inline-block w-28 border-b border-blue-800 " />
            </div>
          </div>
        </header>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-[15px] text-blue-800">(株)LIFTING様</div>
          </div>
          <div className="mt-3 flex items-center justify-between text-blue-800">
            <div>下記のとおり御請求申し上げます</div>
            <div className="flex items-center gap-3">
              <span>登録番号</span>
              <span className="inline-block w-36 border-b border-blue-800" />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="inline-block px-3 py-1 border border--bleu-800 text-blue-800">
            税込合計金額 ¥{amount}
          </div>

          {/*メインテーブル*/}
          <div className="mt-1 border border-b-blue-800 text-blue-800">
            {/* テーブルヘッダ（二段構造の右肩に"消費税額等"） */}
            <div className="grid grid-cols-[56px_1fr_84px_84px_110px_110px_80px_1fr]">
              {/* 上段の右肩ラベル */}
              <div className="col-span-8 border-b border-blue-800">
                <div className="ml-auto w-44 text-center border-1 border-blue-800">
                  消費税等
                </div>
              </div>

              {/* 見出し行 */}
              <div className="contents text-center">
                <div className="border-r border-blue-800 py-1">月日</div>
                <div className="border-r border-blue-800 py-1">品名</div>
                <div className="border-r border-blue-800 py-1">数量</div>
                <div className="border-r border-blue-800 py-1">単価</div>
                <div className="border-r border-blue-800 py-1">
                  金額（税抜き・税込）
                </div>
                <div className="border-r border-blue-800 py-1">
                  <div className="relative">
                    <span> </span>
                    <div className="absolute inset-y-0 left-1/2 w-px bg-blue-800" />
                  </div>
                </div>
                <div className="border-r border-blue-800 py-1">税率(%)</div>
                <div className="p-1">摘要</div>
              </div>

              {/* 仕切り　ヘッダ下の水平線 */}
              <div className="col-span-8 bg-blue-800"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
