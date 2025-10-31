"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SupportRequest {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  user_profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function Settings() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(
    null
  );
  const [updating, setUpdating] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");

  useEffect(() => {
    fetchSupportRequests();

    // Check if user is admin
    checkAdminStatus();

    // Set up real-time subscription for new support requests
    const channel = supabase
      .channel("support_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_requests",
        },
        () => {
          console.log("Support request change detected, refreshing...");
          fetchSupportRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAdminStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("Current user ID:", user?.id);

      if (user) {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("id, email, role")
          .eq("id", user.id)
          .single();

        console.log("User profile:", data);
        console.log("Is admin?", data?.role === "admin");

        if (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const fetchSupportRequests = async () => {
    setLoading(true);
    try {
      // First, fetch support requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("support_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (requestsError) {
        console.error("Supabase error:", requestsError);
        alert(`Error fetching support requests: ${requestsError.message}`);
        throw requestsError;
      }

      // Then, fetch user profiles for each request
      if (requestsData && requestsData.length > 0) {
        const userIds = [...new Set(requestsData.map((r) => r.user_id))];

        const { data: profilesData, error: profilesError } = await supabase
          .from("user_profiles")
          .select("id, first_name, last_name, email")
          .in("id", userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        }

        // Merge the data
        const mergedData = requestsData.map((request) => ({
          ...request,
          user_profiles:
            profilesData?.find((p) => p.id === request.user_id) || null,
        }));

        console.log("Fetched support requests:", mergedData);
        setRequests(mergedData);
      } else {
        console.log("No support requests found");
        setRequests([]);
      }
    } catch (error: any) {
      console.error("Error fetching support requests:", error);
      alert(
        `Failed to load support requests: ${error?.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("support_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;

      // Update local state
      setRequests(
        requests.map((req) =>
          req.id === requestId ? { ...req, status: newStatus as any } : req
        )
      );

      if (selectedRequest?.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: newStatus as any });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const sendResponse = async () => {
    if (!selectedRequest || !adminResponse.trim()) return;

    setUpdating(true);
    try {
      // Update the support request with admin response
      const { error } = await supabase
        .from("support_requests")
        .update({
          admin_response: adminResponse,
          responded_at: new Date().toISOString(),
          status: "resolved",
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      // Update local state
      setRequests(
        requests.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                admin_response: adminResponse,
                status: "resolved" as any,
                responded_at: new Date().toISOString(),
              }
            : req
        )
      );

      setAdminResponse("");
      setSelectedRequest(null);
      alert("Response sent successfully and ticket marked as resolved!");
    } catch (error) {
      console.error("Error sending response:", error);
      alert("Failed to send response");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      in_progress: { color: "bg-blue-100 text-blue-800", icon: AlertCircle },
      resolved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      closed: { color: "bg-gray-100 text-gray-800", icon: XCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    resolved: requests.filter((r) => r.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Support Requests
        </h1>
        <p className="text-gray-600">
          Manage and respond to user support requests and technical issues.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.in_progress}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.resolved}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Support Tickets</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading support requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No support requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card
                  key={request.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {request.subject}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {request.message}
                            </p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>
                              {request.user_profiles?.first_name}{" "}
                              {request.user_profiles?.last_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{request.user_profiles?.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(
                                request.created_at
                              ).toLocaleDateString()}{" "}
                              {new Date(
                                request.created_at
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:min-w-[200px]">
                        <Select
                          value={request.status}
                          onValueChange={(value) =>
                            updateRequestStatus(request.id, value)
                          }
                          disabled={updating}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                              className="w-full"
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{request.subject}</DialogTitle>
                              <DialogDescription>
                                Support Request #{request.id.slice(0, 8)}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              {/* User Info */}
                              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <h4 className="font-semibold text-sm">
                                  User Information
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <span className="font-medium">Name:</span>{" "}
                                    {request.user_profiles?.first_name}{" "}
                                    {request.user_profiles?.last_name}
                                  </p>
                                  <p>
                                    <span className="font-medium">Email:</span>{" "}
                                    {request.user_profiles?.email}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Submitted:
                                    </span>{" "}
                                    {new Date(
                                      request.created_at
                                    ).toLocaleString()}
                                  </p>
                                  <p>
                                    <span className="font-medium">Status:</span>{" "}
                                    {getStatusBadge(request.status)}
                                  </p>
                                </div>
                              </div>

                              {/* Message */}
                              <div>
                                <h4 className="font-semibold text-sm mb-2">
                                  Message
                                </h4>
                                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {request.message}
                                  </p>
                                </div>
                              </div>

                              {/* Admin Response */}
                              <div>
                                <h4 className="font-semibold text-sm mb-2">
                                  Send Response (Optional)
                                </h4>
                                <Textarea
                                  value={adminResponse}
                                  onChange={(e) =>
                                    setAdminResponse(e.target.value)
                                  }
                                  placeholder="Type your response to the user..."
                                  rows={4}
                                  className="mb-2"
                                />
                                <Button
                                  onClick={sendResponse}
                                  disabled={updating || !adminResponse.trim()}
                                  className="w-full"
                                >
                                  {updating
                                    ? "Sending..."
                                    : "Send Response & Mark Resolved"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
