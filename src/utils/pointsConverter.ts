
// Points to RM conversion utility
// Conversion rate: 1 point = 1 RM
export const POINTS_TO_RM_RATE = 1;

export function convertPointsToRM(points: number): number {
  return Number((points / POINTS_TO_RM_RATE).toFixed(2));
}

export function formatRM(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}

export function canAffordOrder(totalPoints: number, orderTotal: number): boolean {
  const availableRM = convertPointsToRM(totalPoints);
  return availableRM >= orderTotal;
}
