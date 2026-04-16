/** 값이 없을 때 '-' 로 표시하는 컨벤션 */
export const displayOrDash = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  const s = String(value).trim();
  return s.length === 0 ? '-' : s;
};
