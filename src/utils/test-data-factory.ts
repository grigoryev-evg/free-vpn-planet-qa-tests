export const createUniqueEmail = (domain: string): string => {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8);

  return `qa${timestamp}${random}@${domain}`;
};
