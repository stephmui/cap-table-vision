import { useQuery } from "@tanstack/react-query";
import ShareholderTable from "@/components/ShareholderTable";
import TermSheetAnalyzer from "@/components/TermSheetAnalyzer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CapTablePage() {
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
      
      <Tabs defaultValue="cap-table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cap-table">Cap Table</TabsTrigger>
          <TabsTrigger value="term-sheet">Term Sheet</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cap-table" className="space-y-4">
          <ShareholderTable shareholders={shareholders} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="term-sheet" className="space-y-4">
          <TermSheetAnalyzer shareholders={shareholders} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
