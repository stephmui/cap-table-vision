import { useQuery } from "@tanstack/react-query";
import ShareholderTable from "@/components/ShareholderTable";

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
      <ShareholderTable shareholders={shareholders} isLoading={isLoading} />
    </div>
  );
}
