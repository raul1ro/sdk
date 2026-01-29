export const stringToCharCodes = (str: string): number[] => {
  return Array.from(str).map((ch) => ch.charCodeAt(0));
};
