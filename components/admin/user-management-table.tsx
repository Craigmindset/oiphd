"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface User {
  id: number
  firstName: string
  lastName: string
  gender: string
  email: string
  phone: string
  country: string
  moduleProgress: number
  caseImage?: string
}

export function UserManagementTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "progress">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Sample user data
  const users: User[] = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      gender: "Male",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      country: "United States",
      moduleProgress: 30,
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      gender: "Female",
      email: "jane@example.com",
      phone: "+1 (555) 234-5678",
      country: "Canada",
      moduleProgress: 60,
    },
    {
      id: 3,
      firstName: "Michael",
      lastName: "Johnson",
      gender: "Male",
      email: "michael@example.com",
      phone: "+1 (555) 345-6789",
      country: "United Kingdom",
      moduleProgress: 90,
    },
    {
      id: 4,
      firstName: "Sarah",
      lastName: "Williams",
      gender: "Female",
      email: "sarah@example.com",
      phone: "+1 (555) 456-7890",
      country: "Australia",
      moduleProgress: 0,
    },
    {
      id: 5,
      firstName: "David",
      lastName: "Brown",
      gender: "Male",
      email: "david@example.com",
      phone: "+1 (555) 567-8901",
      country: "Nigeria",
      moduleProgress: 100,
    },
  ]

  // Filter and sort users
  const filteredUsers = users
    .filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === "name") {
        comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      } else {
        comparison = a.moduleProgress - b.moduleProgress
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  const toggleSort = (column: "name" | "progress") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress === 0) return "bg-gray-100 text-gray-700"
    if (progress < 50) return "bg-yellow-100 text-yellow-700"
    if (progress < 100) return "bg-blue-100 text-blue-700"
    return "bg-green-100 text-green-700"
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">User Management</h1>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Name
                    {sortBy === "name" &&
                      (sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                  </button>
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Gender</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Country</th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => toggleSort("progress")}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Progress
                    {sortBy === "progress" &&
                      (sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                  </button>
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.gender}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                  <td className="px-6 py-4 text-gray-600">{user.country}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${user.moduleProgress}%` }}
                        ></div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getProgressColor(user.moduleProgress)}`}
                      >
                        {user.moduleProgress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm" className="bg-transparent">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found matching your search.</p>
          </div>
        )}
      </Card>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.filter((u) => u.moduleProgress > 0).length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-gray-900">{users.filter((u) => u.moduleProgress === 100).length}</p>
        </Card>
      </div>
    </div>
  )
}
