import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { insertShareholderSchema, type InsertShareholder, type Shareholder } from "@db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ShareholderTableProps {
  shareholders?: Shareholder[];
  isLoading: boolean;
}

export default function ShareholderTable({ shareholders, isLoading }: ShareholderTableProps) {
  const { toast } = useToast();
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

  const addMutation = useMutation({
    mutationFn: async (data: InsertShareholder) => {
      const response = await fetch("/api/shareholders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          sharesOwned: String(data.sharesOwned),
          optionsGranted: String(data.optionsGranted),
        }),
      });
      if (!response.ok) throw new Error("Failed to add shareholder");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareholders"] });
      toast({
        title: "Success",
        description: "Shareholder added successfully",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add shareholder",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/shareholders/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete shareholder");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareholders"] });
      toast({
        title: "Success",
        description: "Shareholder deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete shareholder",
        variant: "destructive",
      });
    },
  });

  const calculateOwnership = (shareholder: Shareholder) => {
    if (!shareholders?.length) return "0.00";
    
    const totalEquity = shareholders.reduce((acc, s) => 
      acc + Number(s.sharesOwned) + Number(s.optionsGranted), 0
    );
    
    if (totalEquity === 0) return "0.00";
    
    const ownership = ((Number(shareholder.sharesOwned) + Number(shareholder.optionsGranted)) / totalEquity) * 100;
    return ownership.toFixed(2);
  };

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
              <DialogDescription>
                Enter the shareholder details below. Share counts can include decimals for fractional shares.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => addMutation.mutate(data))}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label>Name</label>
                    <Input 
                      {...form.register("name")} 
                      placeholder="Enter shareholder name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Shares Owned</label>
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register("sharesOwned")}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label>Options Granted</label>
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register("optionsGranted")}
                      placeholder="0.00"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={addMutation.isPending}
                  >
                    {addMutation.isPending ? "Adding..." : "Add Shareholder"}
                  </Button>
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
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Options</TableHead>
            <TableHead className="text-right">Ownership %</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shareholders?.map((shareholder) => (
            <TableRow key={shareholder.id}>
              <TableCell>{shareholder.name}</TableCell>
              <TableCell className="text-right">
                {Number(shareholder.sharesOwned).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right">
                {Number(shareholder.optionsGranted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right">{calculateOwnership(shareholder)}%</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (shareholder.id) {
                      if (window.confirm(`Are you sure you want to delete ${shareholder.name}?`)) {
                        deleteMutation.mutate(shareholder.id);
                      }
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
