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
  const postMoney = investment?.amount && investment?.preMoney ? 
    calculatePostMoney(investment.preMoney, investment.amount) : 0;
  const newShares = totalShares > 0 && investment?.amount && investment?.preMoney ? 
    calculateNewShares(investment.amount, investment.preMoney, totalShares) : 0;
  const dilution = calculateDilution(totalShares, newShares);
  const newOwnership = calculateOwnershipPercentage(newShares, totalShares + newShares);

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
            <label className="block text-sm font-medium mb-2">Pre-money Valuation ($)</label>
            <Input
              type="number"
              min="0"
              value={investment.preMoney || ''}
              onChange={(e) => onInvestmentChange({ 
                ...investment, 
                preMoney: Number(e.target.value) 
              })}
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
            <label className="block text-sm font-medium mb-2">Post-money Valuation</label>
            <div className="p-2 border rounded bg-muted font-mono">
              ${postMoney.toLocaleString()}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">New Shares Issued</label>
            <div className="p-2 border rounded bg-muted font-mono">
              {newShares.toLocaleString()}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Price Per Share</label>
            <div className="p-2 border rounded bg-muted font-mono">
              ${(investment.preMoney / totalShares || 0).toFixed(2)}
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
