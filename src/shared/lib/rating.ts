export const clampRating = (value: number): number => Math.min(5, Math.max(1, Number(value) || 1));
