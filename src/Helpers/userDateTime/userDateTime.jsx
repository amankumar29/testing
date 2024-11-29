import { format, isValid, parseISO } from "date-fns";

export default function userDateTime(dateString) {
  if (!dateString) {
    return "No Date";
  }

  const date = parseISO(dateString);

  if (!isValid(date)) {
    return "Invalid Date";
  }

  return format(date, "HH:mm:ss MMM dd, yyyy");
}
