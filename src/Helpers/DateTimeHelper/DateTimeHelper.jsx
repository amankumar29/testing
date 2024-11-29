// src/DateTimeHelper.js
export function formatLocalDateTime(utcDateString) {
  const date = new Date(utcDateString);

  // Get the user's local timezone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Format the date part
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format the time part
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  // Get the formatted date and time strings
  const formattedDate = dateFormatter.format(date);
  const formattedTime = timeFormatter.format(date);

  return {
    date: formattedDate,
    time: formattedTime,
  };
}
