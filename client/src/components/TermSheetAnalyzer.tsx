import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { calculatePostMoney, calculateNewShares } from "../lib/calculations";

interface TermSheetAnalyzerProps {
  shareholders?: any[];
}

export default function TermSheetAnalyzer({ shareholders }: TermSheetAnalyzerProps) {
  const [investment, setInvestment] = useState({
    amount: 0,
    preMoney: 0,
    optionPool: 0,
  });

  const totalShares = shareholders?.reduce((acc, s) => acc + s.sharesOwned, 0) || 0;
  const postMoney = calculatePostMoney(investment.preMoney, investment.amount);
  const newShares = calculateNewShares(investment.amount, investment.preMoney, totalShares);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Investment Terms</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Investment Amount ($)</label>
            <Input
              type="number"
              value={investment.amount}
              onChange={(e) => setInvestment({ ...investment, amount: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block mb-2">Pre-money Valuation ($)</label>
            <Input
              type="number"
              value={investment.preMoney}
              onChange={(e) => setInvestment({ ...investment, preMoney: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block mb-2">Option Pool (%)</label>
            <Input
              type="number"
              value={investment.optionPool}
              onChange={(e) => setInvestment({ ...investment, optionPool: Number(e.target.value) })}
            />
          </div>
          <Button className="w-full">Calculate Impact</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Analysis Results</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Post-money Valuation</label>
            <div className="p-2 border rounded bg-muted">${postMoney.toLocaleString()}</div>
          </div>
          <div>
            <label className="block mb-2">New Shares Issued</label>
            <div className="p-2 border rounded bg-muted">{newShares.toLocaleString()}</div>
          </div>
          <div>
            <label className="block mb-2">Price Per Share</label>
            <div className="p-2 border rounded bg-muted">
              ${(investment.preMoney / totalShares).toFixed(2)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
