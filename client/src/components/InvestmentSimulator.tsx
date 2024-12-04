import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OwnershipChart from "./OwnershipChart";

interface InvestmentSimulatorProps {
  shareholders?: any[];
}

export default function InvestmentSimulator({ shareholders }: InvestmentSimulatorProps) {
  const [rounds, setRounds] = useState([
    { type: "SAFE", amount: 0, valCap: 0 }
  ]);

  const addRound = () => {
    setRounds([...rounds, { type: "SAFE", amount: 0, valCap: 0 }]);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Investment Rounds</h3>
        <div className="space-y-4">
          {rounds.map((round, index) => (
            <div key={index} className="p-4 border rounded">
              <div className="grid gap-4">
                <Select
                  value={round.type}
                  onValueChange={(value) => {
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
                  <label className="block mb-2">Amount ($)</label>
                  <Input
                    type="number"
                    value={round.amount}
                    onChange={(e) => {
                      const newRounds = [...rounds];
                      newRounds[index].amount = Number(e.target.value);
                      setRounds(newRounds);
                    }}
                  />
                </div>

                <div>
                  <label className="block mb-2">Valuation Cap ($)</label>
                  <Input
                    type="number"
                    value={round.valCap}
                    onChange={(e) => {
                      const newRounds = [...rounds];
                      newRounds[index].valCap = Number(e.target.value);
                      setRounds(newRounds);
                    }}
                  />
                </div>
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
