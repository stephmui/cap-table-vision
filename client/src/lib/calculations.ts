export function calculatePostMoney(preMoney: number = 0, investment: number = 0): number {
  return (preMoney || 0) + (investment || 0);
}

export function calculateNewShares(
  investment: number = 0,
  preMoney: number = 0,
  existingShares: number = 0
): number {
  if (existingShares <= 0 || preMoney <= 0) return 0;
  const pricePerShare = preMoney / existingShares;
  return pricePerShare > 0 ? investment / pricePerShare : 0;
}

export function calculateDilution(
  currentShares: number = 0,
  newShares: number = 0
): number {
  const totalShares = (currentShares || 0) + (newShares || 0);
  return totalShares > 0 ? ((currentShares || 0) / totalShares) * 100 : 0;
}

export function calculateOwnershipPercentage(
  shares: number = 0,
  totalShares: number = 0
): number {
  return totalShares > 0 ? ((shares || 0) / totalShares) * 100 : 0;
}

export function calculateOptionPoolImpact(
  totalShares: number = 0,
  optionPoolPercentage: number = 0
): number {
  if (optionPoolPercentage >= 100 || optionPoolPercentage < 0) return 0;
  return ((totalShares || 0) * optionPoolPercentage) / (100 - optionPoolPercentage);
}
