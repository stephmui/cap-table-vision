import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ShareholderTable from "@/components/ShareholderTable";
import TermSheetAnalyzer from "@/components/TermSheetAnalyzer";
import { Card } from "@/components/ui/card";

export interface Investment {
  amount: number;
  preMoney: number;
  optionPool: number;
}

export default function CapTablePage() {
  const [investment, setInvestment] = useState<Investment>({
    amount: 0,
    preMoney: 0,
    optionPool: 0,
  });

  const { data: shareholders, isLoading } = useQuery({
    queryKey: ["shareholders"],
    queryFn: async () => {
      const response = await fetch("/api/shareholders");
      if (!response.ok) throw new Error("Failed to fetch shareholders");
      return response.json();
    },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Cap Table Calculator</h1>
      
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <Card className="p-6 lg:sticky lg:top-8 h-fit">
          <TermSheetAnalyzer 
            shareholders={shareholders}
            investment={investment}
            onInvestmentChange={setInvestment}
          />
        </Card>

        <div>
          <ShareholderTable 
            shareholders={shareholders} 
            isLoading={isLoading}
            investment={investment}
          />
        </div>
      </div>
    </div>
  );
}
