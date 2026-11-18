export function formatETB(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "0.00 ብር";
  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " ብር"
  );
}

export function formatDateTime(dateVal: string | Date | null | undefined): string {
  if (!dateVal) return "—";
  const date = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
  if (isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Addis_Ababa",
  }).format(date);
}

export function formatDate(dateVal: string | Date | null | undefined): string {
  if (!dateVal) return "—";
  const date = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
  if (isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "Africa/Addis_Ababa",
  }).format(date);
}

export function formatEthiopianPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+251") && cleaned.length === 13) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 13)}`;
  }
  if (cleaned.startsWith("09") || cleaned.startsWith("07")) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
  }
  return phone;
}
