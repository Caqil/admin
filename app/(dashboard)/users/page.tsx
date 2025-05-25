"use client";

import React, { useEffect, useState } from "react";
import { UsersTable } from "@/components/users/users-table";
import { UserFilter } from "@/components/users/user-filter";
import { usersApi } from "@/lib/api";
import { User } from "@/types/user";
import { useToast } from "@/components/ui/use-toast";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await usersApi.getAll();
        setUsers(data);
        setFilteredUsers(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users data");
        toast({
          title: "Error",
          description: "Failed to load users data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  // Handle user block/unblock
  const handleBlockStatusChange = async (
    userId: number,
    isBlocked: boolean
  ) => {
    try {
      if (isBlocked) {
        await usersApi.unblock(userId);
        toast({
          title: "Success",
          description: "User has been unblocked",
        });
      } else {
        await usersApi.block(userId);
        toast({
          title: "Success",
          description: "User has been blocked",
        });
      }

      // Update user in the state
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, is_blocked: !isBlocked } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(
        filteredUsers.map((user) =>
          user.id === userId ? { ...user, is_blocked: !isBlocked } : user
        )
      );
    } catch (error) {
      console.error("Error updating user block status:", error);
      toast({
        title: "Error",
        description: `Failed to ${isBlocked ? "unblock" : "block"} user`,
        variant: "destructive",
      });
    }
  };

  // Filter users
  const handleFilter = (filters: {
    name?: string;
    email?: string;
    status?: "all" | "blocked" | "active" | "verified";
  }) => {
    let result = [...users];

    if (filters.name) {
      result = result.filter((user) =>
        user.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }

    if (filters.email) {
      result = result.filter((user) =>
        user.email.toLowerCase().includes(filters.email!.toLowerCase())
      );
    }

    if (filters.status && filters.status !== "all") {
      switch (filters.status) {
        case "blocked":
          result = result.filter((user) => user.is_blocked);
          break;
        case "active":
          result = result.filter((user) => !user.is_blocked);
          break;
        case "verified":
          result = result.filter((user) => user.is_kyc_verified);
          break;
      }
    }

    setFilteredUsers(result);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">
          Manage all users of your investment platform
        </p>
      </div>

      <UserFilter onFilter={handleFilter} />

      <UsersTable
        users={filteredUsers}
        isLoading={isLoading}
        error={error}
        onBlockStatusChange={handleBlockStatusChange}
      />
    </div>
  );
}
