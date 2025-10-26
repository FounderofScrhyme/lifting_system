import { useState, useCallback, useRef } from "react";

/**
 * 電話番号の自動ハイフン付与を行うカスタムフック（スマホ対応版）
 * @param initialValue 初期値
 * @returns { value, onChange, setValue } フォーマットされた値とハンドラー
 */
export function usePhoneFormat(initialValue: string = "") {
  const [value, setValue] = useState(initialValue);
  const isComposingRef = useRef(false);

  /**
   * 電話番号をフォーマットする関数
   * 090-1234-5678 の形式に自動変換
   */
  const formatPhoneNumber = useCallback((input: string) => {
    // 数字のみを抽出
    const numbers = input.replace(/\D/g, "");

    // 空の場合は空文字を返す
    if (!numbers) return "";

    // 携帯電話番号（11桁）の場合
    if (numbers.length <= 11) {
      if (numbers.length <= 3) {
        return numbers;
      } else if (numbers.length <= 7) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
          7
        )}`;
      }
    }

    // 固定電話番号（10桁）の場合
    if (numbers.length <= 10) {
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 6) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
      } else {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(
          6
        )}`;
      }
    }

    // 11桁を超える場合は11桁で切り詰め
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
      7,
      11
    )}`;
  }, []);

  /**
   * 入力値変更時のハンドラー（Safari対応版）
   */
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // IME入力中は処理をスキップ
      if (isComposingRef.current) return;

      const formatted = formatPhoneNumber(e.target.value);
      setValue(formatted);
    },
    [formatPhoneNumber]
  );

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
        const formatted = formatPhoneNumber(e.currentTarget.value);
        setValue(formatted);
      }, 10);
    },
    [formatPhoneNumber]
  );

  /**
   * Safari用の入力ハンドラー（onInputイベント使用）
   */
  const onInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (isComposingRef.current) return;

      const target = e.currentTarget as HTMLInputElement;
      const formatted = formatPhoneNumber(target.value);
      setValue(formatted);
    },
    [formatPhoneNumber]
  );

  /**
   * プログラム的に値を設定する関数
   */
  const setFormattedValue = useCallback(
    (newValue: string) => {
      const formatted = formatPhoneNumber(newValue);
      setValue(formatted);
    },
    [formatPhoneNumber]
  );

  return {
    value,
    onChange,
    onInput,
    onCompositionStart,
    onCompositionEnd,
    setValue: setFormattedValue,
  };
}
