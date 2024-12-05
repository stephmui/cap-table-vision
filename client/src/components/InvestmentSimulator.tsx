import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calculator } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import OwnershipChart from "./OwnershipChart";
import { 
  calculatePostMoney, 
  calculateNewShares, 
  calculateDilution, 
  calculateOwnershipPercentage,
  calculatePricePerShare 
} from "@/lib/calculations";

interface InvestmentRound {
  id: string;
  type: "SAFE" | "EQUITY" | "CONVERTIBLE";
  amount: number;
  valCap: number;
  discount?: number;
}

interface RoundImpact {
  postMoney: number;
  newShares: number;
  dilution: number;
  newInvestorOwnership: number;
  pricePerShare: number;
  effectiveValuation: number;
}

interface SimulationResult extends InvestmentRound, RoundImpact {
  totalShares: number;
  cumulativeDilution: number;
}

interface InvestmentSimulatorProps {
  shareholders?: any[];
}

export default function InvestmentSimulator({ shareholders }: InvestmentSimulatorProps) {
  const queryClient = useQueryClient();
  interface SavedRound {
    id: number;
    type: "SAFE" | "EQUITY" | "CONVERTIBLE";
    amount: string;
    valuation_cap: string;
    discount_rate: string | null;
    round_number: number;
    date_added: string;
  }

  const { data: savedRounds, isLoading: isLoadingRounds } = useQuery<SavedRound[]>({
    queryKey: ["investmentRounds"],
    queryFn: async () => {
      const response = await fetch("/api/investment-rounds");
      if (!response.ok) throw new Error("Failed to fetch investment rounds");
      return response.json();
    },
  });

  const [rounds, setRounds] = useState<InvestmentRound[]>([]);

  useEffect(() => {
    if (savedRounds?.length > 0) {
      setRounds(savedRounds.map(round => ({
        id: String(round.id),
        type: round.type,
        amount: Number(round.amount),
        valCap: Number(round.valuation_cap),
        discount: round.discount_rate ? Number(round.discount_rate) : undefined
      })));
    } else {
      setRounds([{ 
        id: "round-1",
        type: "SAFE", 
        amount: 0, 
        valCap: 0, 
        discount: 0 
      }]);
    }
  }, [savedRounds]);

  const totalShares = useMemo(() => {
    return shareholders?.reduce((acc, s) => acc + Number(s.sharesOwned || 0), 0) || 0;
  }, [shareholders]);

  const calculateRoundImpact = (round: InvestmentRound, currentShares: number, previousValuation?: number) => {
    let effectiveValuation = round.valCap;
    
    if (round.type === "CONVERTIBLE" && round.discount && previousValuation) {
      const discountedValuation = previousValuation * (1 - round.discount / 100);
      effectiveValuation = Math.min(round.valCap, discountedValuation);
    }

    const postMoney = calculatePostMoney(effectiveValuation, round.amount);
    const newShares = calculateNewShares(round.amount, effectiveValuation, currentShares);
    const dilution = calculateDilution(currentShares, newShares);
    const newInvestorOwnership = calculateOwnershipPercentage(newShares, currentShares + newShares);
    const pricePerShare = calculatePricePerShare(effectiveValuation, currentShares);

    return {
      postMoney,
      newShares,
      dilution,
      newInvestorOwnership,
      pricePerShare,
      effectiveValuation
    };
  };

  const simulationResults = useMemo(() => {
    let currentShares = totalShares;
    let previousValuation: number | undefined;
    let results: SimulationResult[] = [];
    
    rounds.forEach((round, index) => {
      const impact = calculateRoundImpact(round, currentShares, previousValuation);
      currentShares += impact.newShares;
      
      // Calculate cumulative dilution from initial ownership
      const initialOwnership = 100;
      const currentOwnership = (totalShares / currentShares) * 100;
      const cumulativeDilution = initialOwnership - currentOwnership;
      
      const result = {
        ...round,
        ...impact,
        cumulativeDilution,
        totalShares: currentShares,
      };
      
      results.push(result);
      previousValuation = impact.postMoney;
    });
    
    return results;
  }, [rounds, totalShares]);

  const addRoundMutation = useMutation({
    mutationFn: async (round: Omit<InvestmentRound, "id">) => {
      const response = await fetch("/api/investment-rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: round.type,
          amount: round.amount,
          valuation_cap: round.valCap,
          discount_rate: round.discount,
          round_number: rounds.length + 1
        }),
      });
      if (!response.ok) throw new Error("Failed to add investment round");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["investmentRounds"] });
    },
  });

  const addRound = () => {
    addRoundMutation.mutate({ 
      type: "SAFE", 
      amount: 0, 
      valCap: 0, 
      discount: 0 
    });
  };

  const deleteRoundMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/investment-rounds/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete investment round");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investmentRounds"] });
    },
  });

  const removeRound = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this investment round?")) {
      await deleteRoundMutation.mutate(Number(id));
    }
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
                    onClick={() => removeRound(round.id)}
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
