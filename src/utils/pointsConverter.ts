// Points to RM conversion utility
// Conversion rate: 1 point = 1 RM
export const POINTS_TO_RM_RATE = 1;

export const convertPointsToRM = (points: number): number => {
  if (isNaN(points) || typeof points !== 'number') {
    return 0;
  }
  const converted = points * POINTS_TO_RM_RATE;
  return isNaN(converted) ? 0 : converted;
};

export function formatRM(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}

export function canAffordOrder(totalPoints: number, orderTotal: number): boolean {
  const availableRM = convertPointsToRM(totalPoints);
  return availableRM >= orderTotal;
}