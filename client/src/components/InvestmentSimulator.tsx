import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OwnershipChart from "./OwnershipChart";
import { calculatePostMoney, calculateNewShares, calculateDilution, calculateOwnershipPercentage } from "@/lib/calculations";

interface InvestmentRound {
  type: "SAFE" | "EQUITY" | "CONVERTIBLE";
  amount: number;
  valCap: number;
  discount?: number;
}

interface InvestmentSimulatorProps {
  shareholders?: any[];
}

export default function InvestmentSimulator({ shareholders }: InvestmentSimulatorProps) {
  const [rounds, setRounds] = useState<InvestmentRound[]>([
    { type: "SAFE", amount: 0, valCap: 0, discount: 0 }
  ]);

  const totalShares = useMemo(() => {
    return shareholders?.reduce((acc, s) => acc + Number(s.sharesOwned || 0), 0) || 0;
  }, [shareholders]);

  const calculateRoundImpact = (round: InvestmentRound, currentShares: number) => {
    const postMoney = calculatePostMoney(round.valCap, round.amount);
    const newShares = calculateNewShares(round.amount, round.valCap, currentShares);
    const dilution = calculateDilution(currentShares, newShares);
    const newInvestorOwnership = calculateOwnershipPercentage(newShares, currentShares + newShares);

    return {
      postMoney,
      newShares,
      dilution,
      newInvestorOwnership,
      pricePerShare: round.valCap / currentShares
    };
  };

  const simulationResults = useMemo(() => {
    let currentShares = totalShares;
    return rounds.map((round) => {
      const impact = calculateRoundImpact(round, currentShares);
      currentShares += impact.newShares;
      return impact;
    });
  }, [rounds, totalShares]);

  const addRound = () => {
    setRounds([...rounds, { type: "SAFE", amount: 0, valCap: 0, discount: 0 }]);
  };

  const removeRound = (index: number) => {
    setRounds(rounds.filter((_, i) => i !== index));
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Investment Rounds</h3>
        <div className="space-y-4">
          {rounds.map((round, index) => (
            <div key={index} className="p-4 border rounded">
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Round {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRound(index)}
                    className="text-destructive"
                  >
                    Remove
                  </Button>
                </div>

                <Select
                  value={round.type}
                  onValueChange={(value: "SAFE" | "EQUITY" | "CONVERTIBLE") => {
                    const newRounds = [...rounds];
                    newRounds[index].type = value;
                    setRounds(newRounds);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Investment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAFE">SAFE</SelectItem>
                    <SelectItem value="EQUITY">Equity</SelectItem>
                    <SelectItem value="CONVERTIBLE">Convertible Note</SelectItem>
                  </SelectContent>
                </Select>

                <div>
                  <label className="block text-sm mb-2">Amount ($)</label>
                  <Input
                    type="number"
                    value={round.amount || ''}
                    onChange={(e) => {
                      const newRounds = [...rounds];
                      newRounds[index].amount = Number(e.target.value);
                      setRounds(newRounds);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    {round.type === "SAFE" ? "Valuation Cap ($)" : "Pre-money Valuation ($)"}
                  </label>
                  <Input
                    type="number"
                    value={round.valCap || ''}
                    onChange={(e) => {
                      const newRounds = [...rounds];
                      newRounds[index].valCap = Number(e.target.value);
                      setRounds(newRounds);
                    }}
                  />
                </div>

                {round.type === "CONVERTIBLE" && (
                  <div>
                    <label className="block text-sm mb-2">Discount (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={round.discount || ''}
                      onChange={(e) => {
                        const newRounds = [...rounds];
                        newRounds[index].discount = Number(e.target.value);
                        setRounds(newRounds);
                      }}
                    />
                  </div>
                )}

                {simulationResults[index] && (
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Post-money Valuation:</div>
                      <div className="font-mono">${simulationResults[index].postMoney.toLocaleString()}</div>
                      <div>New Shares:</div>
                      <div className="font-mono">{Math.round(simulationResults[index].newShares).toLocaleString()}</div>
                      <div>Price per Share:</div>
                      <div className="font-mono">${simulationResults[index].pricePerShare.toFixed(2)}</div>
                      <div>Dilution:</div>
                      <div className="font-mono">{simulationResults[index].dilution.toFixed(2)}%</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <Button onClick={addRound} variant="outline" className="w-full">
            Add Investment Round
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Dilution Impact</h3>
        <OwnershipChart
          shareholders={shareholders}
          simulatedRounds={rounds}
        />
      </Card>
    </div>
  );
}
