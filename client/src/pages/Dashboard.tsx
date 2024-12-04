import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShareholderTable from "../components/ShareholderTable";
import TermSheetAnalyzer from "../components/TermSheetAnalyzer";
import InvestmentSimulator from "../components/InvestmentSimulator";
import OwnershipChart from "../components/OwnershipChart";

export default function Dashboard() {
  const { data: shareholders, isLoading } = useQuery({
    queryKey: ["shareholders"],
    queryFn: async () => {
      const response = await fetch("/api/shareholders");
      if (!response.ok) throw new Error("Failed to fetch shareholders");
      return response.json();
    },
  });

  return (
    <div className="container p-4 mx-auto font-mono">
      <h1 className="mb-8 text-2xl font-bold text-primary">Cap Table Calculator</h1>
      
      <div className="grid gap-6">
        <Card className="p-6">
          <Tabs defaultValue="shareholders">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="shareholders">Shareholders</TabsTrigger>
              <TabsTrigger value="analyzer">Term Sheet Analyzer</TabsTrigger>
              <TabsTrigger value="simulator">Investment Simulator</TabsTrigger>
            </TabsList>
            
            <TabsContent value="shareholders">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="col-span-1">
                  <ShareholderTable
                    shareholders={shareholders}
                    isLoading={isLoading}
                  />
                </div>
                <div className="col-span-1">
                  <OwnershipChart shareholders={shareholders} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analyzer">
              <TermSheetAnalyzer shareholders={shareholders} />
            </TabsContent>
            
            <TabsContent value="simulator">
              <InvestmentSimulator shareholders={shareholders} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
