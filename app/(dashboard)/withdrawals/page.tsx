"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { WithdrawalsTable } from "../../../components/withdrawals/withdrawals-table";
import { Withdrawal } from "../../../types/withdrawal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

export default function WithdrawalsPage() {
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>(
    []
  );
  const [approvedWithdrawals, setApprovedWithdrawals] = useState<Withdrawal[]>(
    []
  );
  const [rejectedWithdrawals, setRejectedWithdrawals] = useState<Withdrawal[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch withdrawals data
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        setIsLoading(true);

        // Fetch withdrawals by status
        const pendingData = await withdrawalsApi.getAll({ status: "pending" });
        const approvedData = await withdrawalsApi.getAll({
          status: "approved",
        });
        const rejectedData = await withdrawalsApi.getAll({
          status: "rejected",
        });

        setPendingWithdrawals(pendingData);
        setApprovedWithdrawals(approvedData);
        setRejectedWithdrawals(rejectedData);

        setError(null);
      } catch (error) {
        console.error("Error fetching withdrawals:", error);
        setError("Failed to load withdrawals data");
        toast({
          title: "Error",
          description: "Failed to load withdrawals data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWithdrawals();
  }, [toast]);

  // Handle withdrawal approval
  const handleApproveWithdrawal = async (id: number, adminNote: string) => {
    try {
      await withdrawalsApi.approve(id, adminNote);

      // Move withdrawal from pending to approved
      const withdrawal = pendingWithdrawals.find((w) => w.id === id);
      if (withdrawal) {
        setPendingWithdrawals(pendingWithdrawals.filter((w) => w.id !== id));
        setApprovedWithdrawals([
          { ...withdrawal, status: "approved", admin_note: adminNote },
          ...approvedWithdrawals,
        ]);
      }

      toast({
        title: "Success",
        description: "Withdrawal has been approved",
      });
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to approve withdrawal",
        variant: "destructive",
      });
    }
  };

  // Handle withdrawal rejection
  const handleRejectWithdrawal = async (id: number, reason: string) => {
    try {
      await withdrawalsApi.reject(id, reason);

      // Move withdrawal from pending to rejected
      const withdrawal = pendingWithdrawals.find((w) => w.id === id);
      if (withdrawal) {
        setPendingWithdrawals(pendingWithdrawals.filter((w) => w.id !== id));
        setRejectedWithdrawals([
          { ...withdrawal, status: "rejected", admin_note: reason },
          ...rejectedWithdrawals,
        ]);
      }

      toast({
        title: "Success",
        description: "Withdrawal has been rejected",
      });
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to reject withdrawal",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Withdrawals</h2>
        <p className="text-muted-foreground">
          Manage withdrawal requests from users
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Withdrawals
            </CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingWithdrawals.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Today
            </CardTitle>
            <CardDescription>Successfully processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                approvedWithdrawals.filter((w) => {
                  const today = new Date();
                  const withdrawalDate = new Date(w.created_at);
                  return today.toDateString() === withdrawalDate.toDateString();
                }).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Amount (Pending)
            </CardTitle>
            <CardDescription>Value of pending requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "BDT",
              }).format(
                pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <WithdrawalsTable
            withdrawals={pendingWithdrawals}
            isLoading={isLoading}
            error={error}
            onApprove={handleApproveWithdrawal}
            onReject={handleRejectWithdrawal}
          />
        </TabsContent>

        <TabsContent value="approved">
          <WithdrawalsTable
            withdrawals={approvedWithdrawals}
            isLoading={isLoading}
            error={error}
            showActions={false}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <WithdrawalsTable
            withdrawals={rejectedWithdrawals}
            isLoading={isLoading}
            error={error}
            showActions={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
