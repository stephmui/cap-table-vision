import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ShareholderTable from "@/components/ShareholderTable";
import TermSheetAnalyzer from "@/components/TermSheetAnalyzer";
import SAFEDocumentParser from "@/components/SAFEDocumentParser";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        <div className="space-y-6">
          <Card className="p-6">
            <Tabs defaultValue="termsheet">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="termsheet">Term Sheet</TabsTrigger>
                <TabsTrigger value="safe">SAFE Parser</TabsTrigger>
              </TabsList>
              
              <TabsContent value="termsheet">
                <TermSheetAnalyzer 
                  shareholders={shareholders}
                  investment={investment}
                  onInvestmentChange={setInvestment}
                />
              </TabsContent>
              
              <TabsContent value="safe">
                <SAFEDocumentParser
                  onTermsExtracted={(terms) => {
                    setInvestment({
                      amount: terms.amount,
                      preMoney: terms.preMoney,
                      optionPool: 0,
                    });
                  }}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

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
