import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
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
    let cumulativeDilution = 0;
    
    return rounds.map((round, index) => {
      const impact = calculateRoundImpact(round, currentShares);
      currentShares += impact.newShares;
      
      // Calculate cumulative dilution from initial ownership
      const initialOwnership = 100;
      const currentOwnership = (totalShares / currentShares) * 100;
      cumulativeDilution = initialOwnership - currentOwnership;
      
      return {
        ...impact,
        cumulativeDilution,
        totalShares: currentShares,
      };
    });
  }, [rounds, totalShares]);

  const addRound = () => {
    setRounds([...rounds, { type: "SAFE", amount: 0, valCap: 0, discount: 0 }]);
  };

  const removeRound = (index: number) => {
    setRounds(rounds.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Investment Rounds</h3>
          <Button onClick={addRound} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Round
          </Button>
        </div>
        
        <div className="space-y-6">
          {rounds.map((round, index) => (
            <Card key={index} className="p-4 border-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium flex items-center gap-2">
                    Round {index + 1}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({round.type})
                    </span>
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRound(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
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
                  </div>

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
                </div>

                {simulationResults[index] && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-muted-foreground">Post-money Valuation:</div>
                      <div className="font-mono text-right">
                        ${simulationResults[index].postMoney.toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">New Shares:</div>
                      <div className="font-mono text-right">
                        {Math.round(simulationResults[index].newShares).toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">Price per Share:</div>
                      <div className="font-mono text-right">
                        ${simulationResults[index].pricePerShare.toFixed(2)}
                      </div>
                      <div className="text-muted-foreground">Round Dilution:</div>
                      <div className="font-mono text-right">
                        {simulationResults[index].dilution.toFixed(2)}%
                      </div>
                      <div className="text-muted-foreground">Cumulative Dilution:</div>
                      <div className="font-mono text-right">
                        {simulationResults[index].cumulativeDilution.toFixed(2)}%
                      </div>
                      <div className="text-muted-foreground">Total Shares:</div>
                      <div className="font-mono text-right">
                        {Math.round(simulationResults[index].totalShares).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ownership Impact</h3>
        <OwnershipChart
          shareholders={shareholders}
          simulatedRounds={rounds}
        />
      </Card>
    </div>
  );
}
