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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { type Investment } from "@/pages/CapTable";
import { calculateDilution, calculateOwnershipPercentage } from "@/lib/calculations";

interface ShareholderTableProps {
  shareholders?: Shareholder[];
  isLoading: boolean;
  investment: Investment;
}

export default function ShareholderTable({ shareholders, isLoading, investment }: ShareholderTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch option pool data
  const { data: optionPool } = useQuery({
    queryKey: ["optionPool"],
    queryFn: async () => {
      const response = await fetch("/api/option-pool");
      if (!response.ok) throw new Error("Failed to fetch option pool");
      return response.json();
    },
  });

  const form = useForm<InsertShareholder>({
    resolver: zodResolver(insertShareholderSchema),
    defaultValues: {
      name: "",
      sharesOwned: "0",
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

  const updateOptionPoolMutation = useMutation({
    mutationFn: async (size: number) => {
      const response = await fetch("/api/option-pool", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size: String(size) }),
      });
      if (!response.ok) throw new Error("Failed to update option pool");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["optionPool"] });
      toast({
        title: "Success",
        description: "Option pool updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update option pool",
        variant: "destructive",
      });
    },
  });

  const calculateOwnership = (sharesOwned: string, includeInvestment: boolean = false) => {
    try {
      if (!shareholders?.length) return "0.00";
      
      // Get total shares from all shareholders with null check
      const totalShares = shareholders.reduce((acc, s) => acc + Number(s?.sharesOwned || 0), 0);
      
      // Add option pool size to get total equity
      const optionPoolSize = optionPool?.size ? Number(optionPool.size || 0) : 0;
      let totalEquity = totalShares + optionPoolSize;
      
      // If including investment impact, add new shares with proper checks
      if (includeInvestment && investment?.amount > 0 && investment?.preMoney > 0) {
        const newShares = calculateNewShares(investment.amount, investment.preMoney, totalShares);
        totalEquity += newShares || 0;
      }
      
      if (totalEquity <= 0) return "0.00";
      
      // Calculate individual ownership with null check
      const ownership = (Number(sharesOwned || 0) / totalEquity) * 100;
      return isNaN(ownership) ? "0.00" : ownership.toFixed(2);
    } catch (error) {
      console.error("Error calculating ownership:", error);
      return "0.00";
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const totalShares = shareholders?.reduce((acc, s) => acc + Number(s.sharesOwned), 0) || 0;
  const optionPoolSize = optionPool?.size ? Number(optionPool.size) : 0;
  const optionPoolPercentage = totalShares > 0 ? (optionPoolSize / (totalShares + optionPoolSize)) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Cap Table</h2>
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

      <div className="mb-6 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Option Pool</h3>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              defaultValue={optionPoolSize}
              onChange={(e) => {
                const value = e.target.value;
                if (!isNaN(Number(value)) && Number(value) >= 0) {
                  e.target.value = value;
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = Number(e.currentTarget.value);
                  if (!isNaN(value) && value >= 0) {
                    updateOptionPoolMutation.mutate(value);
                  }
                }
              }}
              onBlur={(e) => {
                const value = Number(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  updateOptionPoolMutation.mutate(value);
                } else {
                  // Reset to previous valid value if invalid input
                  e.target.value = String(optionPoolSize);
                }
              }}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              ({optionPoolPercentage.toFixed(2)}% of total)
            </span>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Shares</TableHead>
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
                <div className="space-y-1">
                  <div>{calculateOwnership(shareholder.sharesOwned)}%</div>
                  {investment.amount > 0 && investment.preMoney > 0 && (
                    <div className={`text-sm ${
                      Number(calculateOwnership(shareholder.sharesOwned)) > 
                      Number(calculateOwnership(shareholder.sharesOwned, true)) 
                      ? 'text-destructive' 
                      : 'text-muted-foreground'
                    }`}>
                      → {calculateOwnership(shareholder.sharesOwned, true)}%
                    </div>
                  )}
                </div>
              </TableCell>
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
