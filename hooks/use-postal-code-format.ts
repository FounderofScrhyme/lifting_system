import { useState, useCallback } from "react";

export function usePostalCodeFormat(initialValue: string = "") {
  const [value, setValue] = useState(initialValue);

  const formatPostalCode = (input: string) => {
    // 数字のみを抽出
    const numbers = input.replace(/\D/g, "");

    // 7桁の数字をハイフン付きでフォーマット
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      // 7桁を超える場合は7桁まで切り詰め
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}`;
    }
  };

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPostalCode(e.target.value);
    setValue(formatted);
  }, []);

  return {
    value,
    onChange,
    setValue,
  };
}
