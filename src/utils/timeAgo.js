export const timeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const past = date instanceof Date ? date : new Date(date);
  const diff = now - past;
  if (diff < 60_000) return 'Az önce';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} dk önce`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} saat önce`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)} gün önce`;
  return past.toLocaleDateString('tr-TR');
};
