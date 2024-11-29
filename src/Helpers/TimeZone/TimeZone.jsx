import moment from "moment-timezone";

/**
 * Converts a date/time from a specified time zone to UTC.
 * @param {string} date - The date/time string.
 * @param {string} timeZone - The time zone of the date/time string.
 * @returns {string} - The date/time string in UTC.
 * @throws {Error} - If the date or timeZone is invalid.
 */
export const convertToUTC = (date, timeZone) => {
  if (!moment.tz.zone(timeZone)) {
    throw new Error(`Invalid time zone: ${timeZone}`);
  }
  const momentDate = moment.tz(date, timeZone);
  if (!momentDate.isValid()) {
    throw new Error(`Invalid date: ${date}`);
  }
  return momentDate.utc().format();
};

/**
 * Converts a date/time from UTC to a specified time zone.
 * @param {string} date - The date/time string in UTC.
 * @param {string} timeZone - The desired time zone.
 * @returns {string} - The date/time string in the specified time zone.
 * @throws {Error} - If the date or timeZone is invalid.
 */
export const convertFromUTC = (date, timeZone) => {
  if (!moment.tz.zone(timeZone)) {
    throw new Error(`Invalid time zone: ${timeZone}`);
  }
  const momentDate = moment.utc(date);
  if (!momentDate.isValid()) {
    throw new Error(`Invalid date: ${date}`);
  }
  return momentDate.tz(timeZone).format();
};

/**
 * Formats a date/time string in a specified time zone.
 * @param {string} date - The date/time string.
 * @param {string} timeZone - The time zone of the date/time string.
 * @param {string} format - The desired format string.
 * @returns {string} - The formatted date/time string.
 * @throws {Error} - If the date, timeZone, or format is invalid.
 */
export const formatDateTime = (date, timeZone, format) => {
  if (!moment.tz.zone(timeZone)) {
    throw new Error(`Invalid time zone: ${timeZone}`);
  }
  const momentDate = moment.tz(date, timeZone);
  if (!momentDate.isValid()) {
    throw new Error(`Invalid date: ${date}`);
  }
  return momentDate.format(format);
};
