import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const ConvertToLocalTimeZone = (utcTimeStr) => {
  try {
    // Parse the UTC time string to a Date object
    const utcDate = parseISO(utcTimeStr);

    // Check if utcDate is valid
    if (isNaN(utcDate)) {
      throw new Error("Invalid date");
    }

    // Get the system's local timezone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Ensure timeZone is not undefined or null
    if (!timeZone) {
      throw new Error("Could not determine the local time zone");
    }

    // Convert the UTC date to the local date
    const localDate = toZonedTime(utcDate, timeZone);

    // Format the local date to the desired format
    const formattedDate = format(localDate, "MMM dd, yyyy HH:mm:ss");

    return formattedDate;
  } catch (error) {
    console.error("Error converting UTC to local time:", error);
    return "Invalid date/time";
  }
};

export default ConvertToLocalTimeZone;
