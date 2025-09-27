import { useState, useMemo, useCallback } from "react";
import moment from "moment";
import { Site, SiteCalendarEvent } from "@/types/site";

interface UseSiteCalendarOptions {
  sites: Site[];
  onDateSelect?: (date: string) => void;
}

interface UseSiteCalendarReturn {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  events: SiteCalendarEvent[];
  handleNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
  handleSelectSlot: (slotInfo: {
    start: Date;
    end: Date;
    slots: Date[];
  }) => void;
  handleSelectEvent: (event: SiteCalendarEvent) => void;
  getEventStyle: (event: SiteCalendarEvent) => { style: React.CSSProperties };
  getDateCellStyle: (date: Date) => { style: React.CSSProperties } | {};
}

export function useSiteCalendar({
  sites,
  onDateSelect,
}: UseSiteCalendarOptions): UseSiteCalendarReturn {
  const [currentDate, setCurrentDate] = useState(new Date());

  const events = useMemo((): SiteCalendarEvent[] => {
    return sites.map((site) => {
      const date = moment(site.date);
      const startTime = moment(site.startTime, "HH:mm");

      const start = date.clone().set({
        hour: startTime.hour(),
        minute: startTime.minute(),
      });

      let end;
      if (site.siteType === "FULL") {
        end = start.clone().add(8, "hours");
      } else {
        end = start.clone().add(4, "hours");
      }

      return {
        id: site.id,
        title: site.name,
        start: start.toDate(),
        end: end.toDate(),
        resource: site,
      };
    });
  }, [sites]);

  const handleNavigate = useCallback(
    (action: "PREV" | "NEXT" | "TODAY") => {
      const newDate = new Date(currentDate);

      switch (action) {
        case "PREV":
          newDate.setMonth(newDate.getMonth() - 1);
          break;
        case "NEXT":
          newDate.setMonth(newDate.getMonth() + 1);
          break;
        case "TODAY":
          return setCurrentDate(new Date());
      }

      setCurrentDate(newDate);
    },
    [currentDate]
  );

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; slots: Date[] }) => {
      const dateString = moment(slotInfo.start).format("YYYY-MM-DD");
      onDateSelect?.(dateString);
    },
    [onDateSelect]
  );

  const handleSelectEvent = useCallback(
    (event: SiteCalendarEvent) => {
      const dateString = moment(event.start).format("YYYY-MM-DD");
      onDateSelect?.(dateString);
    },
    [onDateSelect]
  );

  const getEventStyle = useCallback((event: SiteCalendarEvent) => {
    const site = event.resource;
    let backgroundColor = "#3174ad";

    if (site.cancelled) {
      backgroundColor = "#dc3545";
    } else if (site.siteType === "AM") {
      backgroundColor = "#28a745";
    } else if (site.siteType === "PM") {
      backgroundColor = "#ffc107";
    }

    return {
      style: {
        backgroundColor,
        color: "white",
        border: "none",
        borderRadius: "4px",
        padding: "2px 4px",
        fontSize: "12px",
      },
    };
  }, []);

  const getDateCellStyle = useCallback((date: Date) => {
    const today = new Date();
    const isToday = moment(date).isSame(today, "day");

    if (isToday) {
      return {
        style: {
          backgroundColor: "#e3f2fd",
        },
      };
    }

    return {};
  }, []);

  return {
    currentDate,
    setCurrentDate,
    events,
    handleNavigate,
    handleSelectSlot,
    handleSelectEvent,
    getEventStyle,
    getDateCellStyle,
  };
}
