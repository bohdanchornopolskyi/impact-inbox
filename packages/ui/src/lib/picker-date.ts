export function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function toISODate(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function parseISODate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

export function formatPickerDate(iso: string) {
  const { year, month, day } = parseISODate(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function formatPickerMonth(yearMonth: string) {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function shiftYearMonth(yearMonth: string, delta: number) {
  const [year, month] = yearMonth.split("-").map(Number);
  const next = new Date(year, month - 1 + delta, 1);
  return `${next.getFullYear()}-${pad2(next.getMonth() + 1)}`;
}

export type CalendarCell = {
  iso: string;
  day: number;
  outside: boolean;
};

export function monthCells(yearMonth: string): CalendarCell[] {
  const [year, month] = yearMonth.split("-").map(Number);
  const first = new Date(year, month - 1, 1);
  const mondayIndex = (first.getDay() + 6) % 7;
  const start = new Date(year, month - 1, 1 - mondayIndex);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + index,
    );
    const cellYear = date.getFullYear();
    const cellMonth = date.getMonth() + 1;
    const day = date.getDate();
    return {
      iso: toISODate(cellYear, cellMonth, day),
      day,
      outside: cellMonth !== month,
    };
  });
}

export function halfHourTimes() {
  return Array.from({ length: 48 }, (_, index) => {
    const hour = Math.floor(index / 2);
    const minute = index % 2 === 0 ? "00" : "30";
    return `${pad2(hour)}:${minute}`;
  });
}

export const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
