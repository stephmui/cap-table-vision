import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { insertShareholderSchema, type InsertShareholder, type Shareholder } from "@db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { type Investment } from "@/pages/CapTable";
import { calculateNewShares, calculateDilution, calculateOwnershipPercentage } from "@/lib/calculations";

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

  const updateOptionPoolMutation = useMutation({
    mutationFn: async (size: string) => {
      const response = await fetch("/api/option-pool", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size }),
      });
      if (!response.ok) throw new Error("Failed to update option pool");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["optionPool"] });
      toast({
        title: "Success",
        description: "Option pool size updated successfully",
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

  const calculateOwnership = (sharesOwned: string, includeInvestment: boolean = false) => {
    try {
      if (!shareholders?.length) return "0.00";
      
      const totalShares = shareholders.reduce((acc, s) => acc + Number(s?.sharesOwned || 0), 0);
      const optionPoolSize = optionPool?.size ? Number(optionPool.size || 0) : 0;
      const initialTotalEquity = totalShares + optionPoolSize;
      
      if (includeInvestment && investment?.amount > 0 && investment?.preMoney > 0) {
        const newInvestorShares = calculateNewShares(investment.amount, investment.preMoney, initialTotalEquity);
        const totalEquity = initialTotalEquity + newInvestorShares;
        const ownership = (Number(sharesOwned || 0) / totalEquity) * 100;
        return isNaN(ownership) ? "0.00" : ownership.toFixed(2);
      }
      
      // For current ownership (without investment)
      if (initialTotalEquity <= 0) return "0.00";
      const ownership = (Number(sharesOwned || 0) / initialTotalEquity) * 100;
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
                Enter the shareholder details below.
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

      

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Current Ownership</TableHead>
            <TableHead className="text-right">Post-Investment</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            // Existing shareholders
            ...(shareholders || []).map((shareholder) => {
              const currentOwnership = Number(calculateOwnership(shareholder.sharesOwned));
              const postOwnership = Number(calculateOwnership(shareholder.sharesOwned, true));
              const ownershipDiff = postOwnership - currentOwnership;
              
              return (
                <TableRow key={shareholder.id}>
                  <TableCell>{shareholder.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    {Number(shareholder.sharesOwned).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {currentOwnership.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className={`font-mono ${
                        ownershipDiff < 0 ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {postOwnership.toFixed(2)}%
                      </span>
                      {ownershipDiff !== 0 && (
                        <span className={`text-xs ${
                          ownershipDiff < 0 ? 'text-destructive' : 'text-green-600'
                        }`}>
                          ({ownershipDiff > 0 ? '+' : ''}{ownershipDiff.toFixed(2)}%)
                        </span>
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
              );
            }),
            // New investor row when there's an investment
            investment?.amount > 0 && investment?.preMoney > 0 && (
              <TableRow key="new-investor">
                <TableCell>New Investor</TableCell>
                <TableCell className="text-right font-mono">
                  {Math.round(calculateNewShares(investment.amount, investment.preMoney, totalShares)).toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono">
                  0.00%
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-success">
                      {calculateOwnershipPercentage(
                        calculateNewShares(investment.amount, investment.preMoney, totalShares),
                        totalShares + calculateNewShares(investment.amount, investment.preMoney, totalShares)
                      ).toFixed(2)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            ),
            // Add Option Pool as a table row
            optionPool && (
              <TableRow key="option-pool">
                <TableCell>Option Pool</TableCell>
                <TableCell className="text-right font-mono">
                  <Input
                    type="text"
                    defaultValue={optionPoolSize.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    onBlur={(e) => {
                      const raw = e.target.value.replace(/,/g, '');
                      const value = Number(raw);
                      if (!isNaN(value) && value >= 0) {
                        updateOptionPoolMutation.mutate(String(value));
                      }
                    }}
                    className="w-32 text-right font-mono"
                  />
                </TableCell>
                <TableCell className="text-right font-mono">
                  <span className="font-mono">{optionPoolPercentage.toFixed(2)}%</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className={`font-mono ${
                      investment?.amount > 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {calculateOwnership(String(optionPoolSize), true)}%
                    </span>
                    {investment?.amount > 0 && (
                      <span className="text-xs text-destructive">
                        ({(Number(calculateOwnership(String(optionPoolSize), true)) - optionPoolPercentage).toFixed(2)}%)
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            )
          ]}
          <TableRow>
            <TableCell colSpan={5} className="py-4">
              <div className="text-sm text-muted-foreground">
                Total Shares: {totalShares.toLocaleString()}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
