"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/lib/supabaseClient";

interface UserProfile {
  id: string;
  registering_for_someone: string | boolean | null;
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
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Helper function to determine if registering for someone
  const isRegisteringForSomeone = (value: string | boolean | null): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.toLowerCase() === "yes";
    return false;
  };

  useEffect(() => {
    const fetchUsersAndProgress = async () => {
      setLoading(true);
      setError(null);
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from("user_profiles")
        .select()
        .eq("role", "user");
      if (usersError) {
        setError(usersError.message);
        setLoading(false);
        return;
      }
      setUsers(usersData || []);

      // Fetch module progress for all users
      const { data: progressData, error: progressError } = await supabase
        .from("module_progress")
        .select("user_id, module_id, completed");
      if (progressError) {
        setError(progressError.message);
        setLoading(false);
        return;
      }

      // Calculate progress percentage for each user
      const MODULES = [
        "module1",
        "module2",
        "module3",
        "prayers",
        "transformation",
      ];
      const userProgress: Record<string, number> = {};
      if (progressData) {
        for (const user of usersData || []) {
          const completed = progressData.filter(
            (row) => row.user_id === user.id && row.completed
          ).length;
          userProgress[user.id] = Math.round(
            (completed / MODULES.length) * 100
          );
        }
      }
      setProgressMap(userProgress);
      setLoading(false);
    };
    fetchUsersAndProgress();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "S/N",
      "Status",
      "Name",
      "Gender",
      "Email",
      "Contact",
      "Country",
      "Work",
      "Address",
      "Expectations",
      "Module",
    ];
    const rows = filteredUsers.map((user: UserProfile, idx: number) => [
      idx + 1,
      isRegisteringForSomeone(user.registering_for_someone) ? "Yes" : "No",
      `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      user.gender || "",
      user.email || "",
      user.phone || "",
      user.country || "",
      user.occupation || "",
      user.address || "",
      user.expectations || "",
      progressMap[user.id] !== undefined ? `${progressMap[user.id]}%` : "0%",
    ]);
    const csvContent = [headers, ...rows]
      .map((e: (string | number)[]) =>
        e
          .map((v: string | number) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "user-management.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const headers = [
      [
        "S/N",
        "Status",
        "Name",
        "Gender",
        "Email",
        "Contact",
        "Country",
        "Work",
        "Address",
        "Expectations",
        "Module",
      ],
    ];
    const rows = filteredUsers.map((user: UserProfile, idx: number) => [
      idx + 1,
      isRegisteringForSomeone(user.registering_for_someone) ? "Yes" : "No",
      `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      user.gender || "",
      user.email || "",
      user.phone || "",
      user.country || "",
      user.occupation || "",
      user.address || "",
      user.expectations || "",
      progressMap[user.id] !== undefined ? `${progressMap[user.id]}%` : "0%",
    ]);
    autoTable(doc, {
      head: headers,
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { top: 20 },
    });
    doc.save("user-management.pdf");
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              Export PDF
            </Button>
          </div>
        </div>
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
      <Card className="overflow-hidden">
        {/* Pagination Controls - Top */}
        {!loading && !error && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-700">
              Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
              <span className="font-semibold">
                {Math.min(endIndex, filteredUsers.length)}
              </span>{" "}
              of <span className="font-semibold">{filteredUsers.length}</span>{" "}
              users
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </div>
          </div>
        )}

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
                  <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">
                    Module
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">{startIndex + idx + 1}</td>
                    <td className="px-4 py-3">
                      {isRegisteringForSomeone(user.registering_for_someone)
                        ? "Yes"
                        : "No"}
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
                    <td className="px-4 py-3 text-blue-700 font-semibold text-sm">
                      {progressMap[user.id] !== undefined
                        ? `${progressMap[user.id]}%`
                        : "0%"}
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

        {/* Pagination Controls */}
        {!loading && !error && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
              <span className="font-semibold">
                {Math.min(endIndex, filteredUsers.length)}
              </span>{" "}
              of <span className="font-semibold">{filteredUsers.length}</span>{" "}
              users
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
