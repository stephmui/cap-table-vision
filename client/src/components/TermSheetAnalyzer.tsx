import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const totalShares = shareholders?.reduce((acc, s) => acc + Number(s.sharesOwned || 0), 0) ?? 0;

  const handlePreMoneyChange = (value: number) => {
    const postMoney = value + (investment.amount || 0);
    onInvestmentChange({ ...investment, preMoney: value });
  };

  const handlePostMoneyChange = (value: number) => {
    const preMoney = value - (investment.amount || 0);
    onInvestmentChange({ ...investment, preMoney });
  };

  const handleInvestmentAmountChange = (value: number) => {
    onInvestmentChange({ 
      ...investment, 
      amount: value,
    });
  };

  const currentPostMoney = (investment.preMoney || 0) + (investment.amount || 0);
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
              onChange={(e) => handleInvestmentAmountChange(Number(e.target.value))}
              className="font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Pre-money Valuation ($)</label>
            <Input
              type="number"
              min="0"
              value={investment.preMoney || ''}
              onChange={(e) => handlePreMoneyChange(Number(e.target.value))}
              className="font-mono"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Post-money Valuation ($)</label>
            <Input
              type="number"
              min="0"
              value={currentPostMoney || ''}
              onChange={(e) => handlePostMoneyChange(Number(e.target.value))}
              className="font-mono"
            />
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
