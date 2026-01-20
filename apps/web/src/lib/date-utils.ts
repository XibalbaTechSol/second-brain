export const formatToMMDDYYYY = (date: string | Date | null | undefined) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

export const formatToISO = (date: string | null | undefined) => {
  if (!date) return '';
  
  // If it's already ISO (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  const parts = date.split('/');
  if (parts.length === 3) {
    // Assume mm/dd/yyyy
    const [m, d, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};
