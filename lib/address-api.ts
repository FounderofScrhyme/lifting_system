/**
 * 郵便番号から住所を取得する関数
 * @param postalCode 郵便番号（ハイフン付きまたは数字のみ）
 * @returns 住所情報またはnull
 */
export async function getAddressFromPostalCode(
  postalCode: string
): Promise<string | null> {
  try {
    // ハイフンを除去して数字のみにする
    const cleanPostalCode = postalCode.replace(/\D/g, "");

    // 7桁の数字でない場合はnullを返す
    if (cleanPostalCode.length !== 7) {
      return null;
    }

    // 郵便番号検索API（zipcloud）を使用
    const response = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanPostalCode}`
    );

    if (!response.ok) {
      throw new Error("住所取得に失敗しました");
    }

    const data = await response.json();

    if (data.status === 200 && data.results && data.results.length > 0) {
      const result = data.results[0];
      // 都道府県 + 市区町村 + 町域名を結合
      return `${result.address1}${result.address2}${result.address3}`;
    }

    return null;
  } catch (error) {
    console.error("住所取得エラー:", error);
    return null;
  }
}
