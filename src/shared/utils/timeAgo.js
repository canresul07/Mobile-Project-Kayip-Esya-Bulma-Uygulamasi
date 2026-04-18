/**
 * Formats a date or timestamp into a "time ago" string in Turkish.
 * @param {Date|number|string} date - Date object, timestamp, or string
 * @returns {string} Formatted time ago string
 */
export const timeAgo = (date) => {
  if (!date) return '';
  const now = new Date().getTime();
  
  // Handle Firestore Timestamp
  let d;
  if (date?.toDate) {
    d = date.toDate();
  } else if (date?.seconds) {
    d = new Date(date.seconds * 1000);
  } else {
    d = new Date(date);
  }

  const past = d.getTime();
  const diff = now - past;

  if (diff < 60_000) return 'Az önce';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} dk önce`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} saat önce`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)} gün önce`;

  return new Date(past).toLocaleDateString('tr-TR');
};
