export const matches = (text: string, query: string): boolean => {
  if (!query) return true;
  return text.toLowerCase().includes(query.toLowerCase());
};

export const joinSearchable = (parts: Array<string | undefined | null>): string =>
  parts.filter(Boolean).join(' ');
