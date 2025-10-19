"use client";

import { memo } from "react";

interface InvoiceCheckCalendarDateCellProps {
  children: React.ReactNode;
  value: Date;
  siteCount?: number;
  isSelected?: boolean;
}

export const InvoiceCheckCalendarDateCell = memo(
  function InvoiceCheckCalendarDateCell({
    children,
    value,
    siteCount = 0,
    isSelected = false,
  }: InvoiceCheckCalendarDateCellProps) {
    return (
      <div
        className={`relative h-full w-full ${
          isSelected ? "bg-primary/10 border-2 border-primary rounded-md" : ""
        }`}
      >
        {children}
        {siteCount > 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div
              className={`text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-background ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {siteCount}
            </div>
          </div>
        )}
      </div>
    );
  }
);
