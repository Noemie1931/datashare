export function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 Ko';
  const mo = bytes / (1024 * 1024);
  if (mo >= 1) return `${mo.toFixed(1).replace('.', ',')} Mo`;
  const ko = bytes / 1024;
  return `${Math.max(1, Math.round(ko))} Ko`;
}
