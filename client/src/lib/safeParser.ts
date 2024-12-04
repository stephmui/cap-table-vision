type SAFETerms = {
  investmentAmount: number;
  valuationCap: number;
  discountRate?: number;
  mostFavoredNation?: boolean;
  proRata?: boolean;
};

export function parseSAFEDocument(text: string): SAFETerms | null {
  try {
    // Extract investment amount (looking for dollar amounts)
    const investmentMatch = text.match(/\$\s*([\d,]+(\.\d{2})?)/);
    const investmentAmount = investmentMatch 
      ? Number(investmentMatch[1].replace(/,/g, ''))
      : 0;

    // Extract valuation cap
    const valCapMatch = text.match(/valuation\s*cap\s*of\s*\$\s*([\d,]+(\.\d{2})?)/i);
    const valuationCap = valCapMatch 
      ? Number(valCapMatch[1].replace(/,/g, ''))
      : 0;

    // Extract discount rate (if present)
    const discountMatch = text.match(/discount\s*(?:rate|of)\s*(\d+)%/i);
    const discountRate = discountMatch 
      ? Number(discountMatch[1])
      : undefined;

    // Check for MFN clause
    const hasMFN = /most\s*favored\s*nation/i.test(text);

    // Check for pro-rata rights
    const hasProRata = /pro[\s-]rata/i.test(text);

    if (investmentAmount && valuationCap) {
      return {
        investmentAmount,
        valuationCap,
        discountRate,
        mostFavoredNation: hasMFN,
        proRata: hasProRata
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error parsing SAFE document:", error);
    return null;
  }
}

export function validateSAFETerms(terms: SAFETerms): string[] {
  const errors: string[] = [];

  if (!terms.investmentAmount || terms.investmentAmount <= 0) {
    errors.push("Investment amount must be greater than 0");
  }

  if (!terms.valuationCap || terms.valuationCap <= 0) {
    errors.push("Valuation cap must be greater than 0");
  }

  if (terms.discountRate !== undefined) {
    if (terms.discountRate <= 0 || terms.discountRate >= 100) {
      errors.push("Discount rate must be between 0 and 100");
    }
  }

  return errors;
}
