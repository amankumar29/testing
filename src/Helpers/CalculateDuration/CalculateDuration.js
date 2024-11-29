// export const calculateDuration = (startTime, endTime) => {
//   if (!startTime || !endTime) {
//     return "00:00:00";
//   }

//   const runStartTime = new Date(startTime);
//   const runEndTime = new Date(endTime);

//   if (isNaN(runStartTime) || isNaN(runEndTime)) {
//     return "00:00:00";
//   }

//   // Calculate the difference in milliseconds
//   const diffMs = runEndTime - runStartTime;

//   // Convert milliseconds to seconds
//   const diffSec = diffMs / 1000;

//   // Calculate hours, minutes, and seconds
//   const hours = Math.floor(diffSec / 3600);
//   const minutes = Math.floor((diffSec % 3600) / 60);
//   const seconds = Math.floor(diffSec % 60);

//   // Format as "HH:MM:SS"
//   const formattedDuration = `${String(hours).padStart(2, "0")}:${String(
//     minutes
//   ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

//   return formattedDuration;
// };

export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return "00:00:00.000";
  }

  const runStartTime = new Date(startTime);
  const runEndTime = new Date(endTime);

  if (isNaN(runStartTime) || isNaN(runEndTime)) {
    return "00:00:00.000";
  }

  // Calculate the difference in milliseconds
  const diffMs = runEndTime - runStartTime;

  // Convert milliseconds to seconds
  const diffSec = diffMs / 1000;

  // Calculate hours, minutes, seconds, and milliseconds
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = Math.floor(diffSec % 60);
  const milliseconds = diffMs % 1000;

  // Format as "HH:MM:SS.mmm"
  const formattedDuration = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(
    milliseconds
  ).padStart(3, "0")}`;

  return formattedDuration;
};

// src/DateTimeHelper.js
export function calculateTimeDuration(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Calculate the difference in milliseconds
  const difference = end - start;

  // Calculate hours, minutes, and seconds from the difference
  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  // Prepare the formatted duration string
  let durationString = "";

  if (hours > 0) {
    durationString += `${hours} hr `;
  }

  if (minutes > 0) {
    durationString += `${minutes} min `;
  }

  if (seconds > 0 || durationString === "") {
    durationString += `${seconds} sec`;
  }

  return durationString.trim();
}
