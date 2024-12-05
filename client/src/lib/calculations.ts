export function calculateOwnershipPercentage(shares: number = 0, totalShares: number = 0): number {
  if (totalShares <= 0) return 0;
  return (shares / totalShares) * 100;
}

export function calculateDilution(currentShares: number = 0, newShares: number = 0): number {
  const totalAfter = currentShares + newShares;
  if (totalAfter <= 0) return 0;
  return ((newShares / totalAfter) * 100);
}

export function calculateNewShares(
  investment: number = 0,
  valuation: number = 0,
  currentShares: number = 0
): number {
  if (valuation <= 0 || currentShares <= 0) return 0;
  const pricePerShare = valuation / currentShares;
  return investment / pricePerShare;
}

export function calculateOptionPoolShares(
  totalShares: number = 0,
  optionPoolPercentage: number = 0
): number {
  if (optionPoolPercentage >= 100 || optionPoolPercentage < 0) return 0;
  return ((totalShares || 0) * optionPoolPercentage) / (100 - optionPoolPercentage);
}

export function calculatePricePerShare(
  valuation: number = 0,
  totalShares: number = 0
): number {
  return totalShares > 0 ? valuation / totalShares : 0;
}

export function calculatePostMoney(
  preMoney: number = 0,
  investment: number = 0
): number {
  return preMoney + investment;
}
