import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { insertShareholderSchema, type InsertShareholder } from "@db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ShareholderTableProps {
  shareholders?: any[];
  isLoading: boolean;
}

export default function ShareholderTable({ shareholders, isLoading }: ShareholderTableProps) {
  const queryClient = useQueryClient();
  const form = useForm<InsertShareholder>({
    resolver: zodResolver(insertShareholderSchema),
    defaultValues: {
      name: "",
      sharesOwned: "0",
      optionsGranted: "0",
      shareClass: "common",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertShareholder) => {
      const response = await fetch("/api/shareholders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add shareholder");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareholders"] });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Shareholders</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Shareholder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Shareholder</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => {
                const formattedData = {
                  ...data,
                  sharesOwned: parseFloat(data.sharesOwned),
                  optionsGranted: parseFloat(data.optionsGranted)
                };
                mutation.mutate(formattedData);
              })}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label>Name</label>
                    <Input {...form.register("name")} />
                  </div>
                  <div className="space-y-2">
                    <label>Shares Owned</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...form.register("sharesOwned")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Options Granted</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...form.register("optionsGranted")}
                    />
                  </div>
                  <Button type="submit">Add Shareholder</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Shares</TableHead>
            <TableHead>Options</TableHead>
            <TableHead>Ownership %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shareholders?.map((shareholder) => (
            <TableRow key={shareholder.id}>
              <TableCell>{shareholder.name}</TableCell>
              <TableCell>{shareholder.sharesOwned}</TableCell>
              <TableCell>{shareholder.optionsGranted}</TableCell>
              <TableCell>
                {((shareholder.sharesOwned / shareholders.reduce((acc, s) => acc + s.sharesOwned, 0)) * 100).toFixed(2)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
