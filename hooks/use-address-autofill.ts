"use client";

import { useState, useCallback } from "react";
import { usePostalCodeFormat } from "@/hooks/use-postal-code-format";
import { getAddressFromPostalCode } from "@/lib/address-api";

interface UseAddressAutofillOptions {
  onAddressFound?: (address: string) => void;
  onPostalCodeChange?: (postalCode: string) => void;
}

export function useAddressAutofill(options: UseAddressAutofillOptions = {}) {
  const { onAddressFound, onPostalCodeChange } = options;
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const postalCodeFormat = usePostalCodeFormat("");

  const fetchAndSetAddress = useCallback(
    async (postalCodeInput: string) => {
      const clean = postalCodeInput.replace(/\D/g, "");
      if (clean.length !== 7) return;
      setIsLoadingAddress(true);
      try {
        const address = await getAddressFromPostalCode(postalCodeInput);
        if (address && onAddressFound) {
          onAddressFound(address);
        }
      } catch (error) {
        console.error("住所取得エラー:", error);
      } finally {
        setIsLoadingAddress(false);
      }
    },
    [onAddressFound]
  );

  const handlePostalCodeChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      postalCodeFormat.onChange(e);
      const value = e.currentTarget.value;
      onPostalCodeChange?.(value);
      await fetchAndSetAddress(value);
    },
    [fetchAndSetAddress, onPostalCodeChange, postalCodeFormat]
  );

  const handlePostalCodeCompositionEnd = useCallback(
    async (e: React.CompositionEvent<HTMLInputElement>) => {
      postalCodeFormat.onCompositionEnd(e);
      const value = e.currentTarget.value;
      onPostalCodeChange?.(value);
      await fetchAndSetAddress(value);
    },
    [fetchAndSetAddress, onPostalCodeChange, postalCodeFormat]
  );

  return {
    postalCodeFormat,
    handlePostalCodeChange,
    handlePostalCodeCompositionEnd,
    isLoadingAddress,
  };
}
