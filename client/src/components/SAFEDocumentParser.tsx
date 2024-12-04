import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseSAFEDocument, validateSAFETerms } from "@/lib/safeParser";
import { type Investment } from "@/pages/CapTable";

interface SAFEDocumentParserProps {
  onTermsExtracted: (investment: Investment) => void;
}

export default function SAFEDocumentParser({ onTermsExtracted }: SAFEDocumentParserProps) {
  const [documentText, setDocumentText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleParse = () => {
    const terms = parseSAFEDocument(documentText);
    
    if (!terms) {
      setErrors(["Could not extract required terms from the document"]);
      return;
    }

    const validationErrors = validateSAFETerms(terms);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    // For SAFE agreements, valuationCap is typically post-money
    const isPostMoney = true;
    const preMoney = terms.valuationCap - terms.investmentAmount;
    
    onTermsExtracted({
      amount: terms.investmentAmount,
      preMoney,
      optionPool: 0, // Option pool size is typically not specified in SAFE
      isPostMoney,
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">SAFE Agreement Parser</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Paste SAFE Agreement Text
          </label>
          <Textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            className="h-[200px] font-mono text-sm"
            placeholder="Paste the text of your SAFE agreement here..."
          />
        </div>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc pl-4">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={handleParse} disabled={!documentText}>
          Extract Terms
        </Button>

        <div className="text-sm text-muted-foreground">
          <p>The parser will attempt to extract:</p>
          <ul className="list-disc pl-4 mt-2">
            <li>Investment Amount</li>
            <li>Valuation Cap</li>
            <li>Discount Rate (if applicable)</li>
            <li>Most Favored Nation Clause</li>
            <li>Pro-rata Rights</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
