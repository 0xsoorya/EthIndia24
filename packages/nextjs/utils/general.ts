export const timeLeft = (expiryDate: string) => {
  const now = new Date();
  const expiry = new Date(parseInt(expiryDate) * 1000);
  const diff = expiry.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${days}d ${hours}h ${minutes}m`;
};

export const defaultImages = [
  "BYvZi1dy0JWTtG13aCbXvq0wj8FmT3nyenavnjThsv0",
  "VPGu-Dr_fUIiHJKfjEJC7EmKLXUrhkX24p7wxGJuSmc",
];
