import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { type Investment } from "@/pages/CapTable";
import { 
  calculatePostMoney, 
  calculateNewShares, 
  calculateOwnershipPercentage,
  calculateDilution 
} from "../lib/calculations";

interface TermSheetAnalyzerProps {
  shareholders?: any[];
  investment: Investment;
  onInvestmentChange: (investment: Investment) => void;
}

export default function TermSheetAnalyzer({ 
  shareholders,
  investment,
  onInvestmentChange,
}: TermSheetAnalyzerProps) {
  const [isPostMoney, setIsPostMoney] = useState(false);
  const totalShares = shareholders?.reduce((acc, s) => acc + Number(s.sharesOwned || 0), 0) ?? 0;
  
  // Calculate pre-money valuation from post-money if needed
  const getPreMoneyValuation = (postMoneyVal: number) => {
    return postMoneyVal - (investment.amount || 0);
  };

  // Calculate post-money valuation from pre-money
  const getPostMoneyValuation = (preMoneyVal: number) => {
    return preMoneyVal + (investment.amount || 0);
  };

  const handleValuationChange = (value: number) => {
    const preMoney = isPostMoney ? getPreMoneyValuation(value) : value;
    onInvestmentChange({ ...investment, preMoney });
  };

  const currentPostMoney = getPostMoneyValuation(investment.preMoney || 0);
  const newShares = totalShares > 0 && investment?.amount && investment?.preMoney ? 
    calculateNewShares(investment.amount, investment.preMoney, totalShares) : 0;
  const dilution = calculateDilution(totalShares, newShares);
  const newOwnership = calculateOwnershipPercentage(newShares, totalShares + newShares);
  const pricePerShare = totalShares > 0 ? (investment.preMoney || 0) / totalShares : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Investment Terms</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Investment Amount ($)</label>
            <Input
              type="number"
              min="0"
              value={investment.amount || ''}
              onChange={(e) => onInvestmentChange({ 
                ...investment, 
                amount: Number(e.target.value) 
              })}
              className="font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Valuation ($)</label>
            <div className="flex flex-col space-y-2">
              <Input
                type="number"
                min="0"
                value={isPostMoney ? currentPostMoney || '' : investment.preMoney || ''}
                onChange={(e) => handleValuationChange(Number(e.target.value))}
                className="font-mono"
              />
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isPostMoney"
                  checked={isPostMoney}
                  onCheckedChange={(checked) => setIsPostMoney(checked as boolean)}
                />
                <label htmlFor="isPostMoney" className="text-sm text-muted-foreground">
                  Post-money valuation
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Option Pool (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={investment.optionPool || ''}
              onChange={(e) => onInvestmentChange({ 
                ...investment, 
                optionPool: Number(e.target.value) 
              })}
              className="font-mono"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pre-money Valuation</label>
            <div className="p-2 border rounded bg-muted font-mono">
              ${(investment.preMoney || 0).toLocaleString()}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Post-money Valuation</label>
            <div className="p-2 border rounded bg-muted font-mono">
              ${currentPostMoney.toLocaleString()}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">New Shares Issued</label>
            <div className="p-2 border rounded bg-muted font-mono">
              {Math.round(newShares).toLocaleString()}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Price Per Share</label>
            <div className="p-2 border rounded bg-muted font-mono">
              ${pricePerShare.toFixed(2)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Dilution</label>
            <div className="p-2 border rounded bg-muted font-mono">
              {dilution.toFixed(2)}%
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">New Investor Ownership</label>
            <div className="p-2 border rounded bg-muted font-mono">
              {newOwnership.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
