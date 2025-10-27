"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UserProfile {
  id: string;
  registering_for_someone: boolean | null;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  occupation: string | null;
  address: string | null;
  expectations: string | null;
}

export function UserManagementTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("user_profiles")
        .select()
        .eq("role", "user");
      if (error) {
        setError(error.message);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          User Management
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
  <Card className="overflow-hidden min-h-0 p-2">
        <div className="overflow-x-auto max-w-full">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading users...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">
                    S/N
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">
                    Country
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">
                    Work
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">
                    Expectations
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {user.registering_for_someone ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {user.gender}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {user.phone}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {user.country}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {user.occupation}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-600 text-sm max-w-[8rem] truncate"
                      title={user.address || ""}
                    >
                      {user.address}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {user.expectations}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Empty State */}
        {!loading && !error && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No users found matching your search.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
