// utils/time.ts
export const getElapsedTime = (start: string) => {
  const startTime = new Date(start).getTime();
  const now = Date.now();
  const diff = Math.floor((now - startTime) / 60000);

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};
