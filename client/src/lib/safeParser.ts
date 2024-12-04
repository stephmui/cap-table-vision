type SAFETerms = {
  investmentAmount: number;
  valuationCap: number;
  discountRate?: number;
  mostFavoredNation?: boolean;
  proRata?: boolean;
};

export function parseSAFEDocument(text: string): SAFETerms | null {
  try {
    // Function to parse number strings with flexible format
    const parseNumber = (str: string): number => {
      if (!str) return 0;
      // Remove all whitespace and commas, then convert to number
      const cleanStr = str.replace(/[\s,]/g, '');
      // Handle both integer and decimal formats
      return Number(cleanStr.includes('.') ? cleanStr : cleanStr + '.00');
    };

    // Extract investment amount with more comprehensive pattern
    const investmentMatch = text.match(/(?:purchase amount|investment amount|amount|agrees to invest)[^\$]*\$\s*([\d,]+(?:\.\d{2})?)/i);
    const investmentAmount = investmentMatch ? parseNumber(investmentMatch[1]) : 0;

    // Extract valuation cap with more formats
    const valCapMatch = text.match(/(?:valuation cap|cap|price cap)[^\$]*\$\s*([\d,]+(?:\.\d{2})?)/i);
    const valuationCap = valCapMatch ? parseNumber(valCapMatch[1]) : 0;

    // Extract discount rate with more variations
    const discountMatch = text.match(/(?:discount rate|discount|discount percentage)[^\d]*(\d+)%/i);
    const discountRate = discountMatch ? Number(discountMatch[1]) : undefined;

    // Check for MFN clause (case insensitive)
    const hasMFN = /most\s*favou?red\s*nation/i.test(text);

    // Check for pro-rata rights (more flexible matching)
    const hasProRata = /pro[\s-]*rata(?:\s+rights?)?/i.test(text);

    // Debug logging for parsing attempts
    console.log('Parsing attempts:', {
      investmentMatch,
      valCapMatch,
      discountMatch,
      parsedValues: {
        investmentAmount,
        valuationCap,
        discountRate,
        hasMFN,
        hasProRata
      }
    });

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
