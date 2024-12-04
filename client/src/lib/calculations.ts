export function calculatePostMoney(preMoney: number, investment: number): number {
  return preMoney + investment;
}

export function calculateNewShares(
  investment: number,
  preMoney: number,
  existingShares: number
): number {
  const pricePerShare = preMoney / existingShares;
  return investment / pricePerShare;
}

export function calculateDilution(
  currentShares: number,
  newShares: number
): number {
  return (currentShares / (currentShares + newShares)) * 100;
}

export function calculateOwnershipPercentage(
  shares: number,
  totalShares: number
): number {
  return (shares / totalShares) * 100;
}

export function calculateOptionPoolImpact(
  totalShares: number,
  optionPoolPercentage: number
): number {
  return (totalShares * optionPoolPercentage) / (100 - optionPoolPercentage);
}
