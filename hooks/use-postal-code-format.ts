import { useState, useCallback, useRef } from "react";

export function usePostalCodeFormat(initialValue: string = "") {
  const [value, setValue] = useState(initialValue);
  const isComposingRef = useRef(false);

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
    // IME入力中は処理をスキップ
    if (isComposingRef.current) return;

    const formatted = formatPostalCode(e.target.value);
    setValue(formatted);
  }, []);

  /**
   * IME入力開始時のハンドラー（Safari対応）
   */
  const onCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  /**
   * IME入力終了時のハンドラー（Safari対応）
   */
  const onCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false;
      // Safariでは少し遅延を設けて確実に処理
      setTimeout(() => {
        const formatted = formatPostalCode(e.currentTarget.value);
        setValue(formatted);
      }, 10);
    },
    [formatPostalCode]
  );

  /**
   * Safari用の入力ハンドラー（onInputイベント使用）
   */
  const onInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (isComposingRef.current) return;

      const target = e.currentTarget as HTMLInputElement;
      const formatted = formatPostalCode(target.value);
      setValue(formatted);
    },
    [formatPostalCode]
  );

  return {
    value,
    onChange,
    onInput,
    onCompositionStart,
    onCompositionEnd,
    setValue,
  };
}
