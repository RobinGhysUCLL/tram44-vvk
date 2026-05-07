// Configuration for ticket sales
export const SALES_DEADLINE = process.env.NEXT_PUBLIC_SALES_DEADLINE
  ? new Date(process.env.NEXT_PUBLIC_SALES_DEADLINE)
  : new Date("2026-02-13T14:00:00");

export const isSalesClosed = () => {
  return new Date() >= SALES_DEADLINE;
};
