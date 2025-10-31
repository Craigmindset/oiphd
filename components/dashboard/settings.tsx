"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabaseClient";
import {
  Share2,
  MessageSquare,
  Facebook,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
} from "lucide-react";

interface SupportRequest {
  id: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  responded_at: string | null;
}

export function Settings() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myRequests, setMyRequests] = useState<SupportRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchMyRequests();

      // Set up real-time subscription for updates
      const channel = supabase
        .channel("my_support_requests")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "support_requests",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchMyRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const fetchMyRequests = async () => {
    if (!user?.id) return;

    setLoadingRequests(true);
    try {
      const { data, error } = await supabase
        .from("support_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMyRequests(data || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim() || !message.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!user || !user.id) {
      setError("You must be logged in to submit a support request.");
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from("support_requests")
        .insert([
          {
            user_id: user.id,
            subject,
            message,
            status: "pending",
            created_at: new Date().toISOString(),
          },
        ]);

      if (insertError) throw insertError;

      setSubmitted(true);
      setSubject("");
      setMessage("");
      setTimeout(() => setSubmitted(false), 3000);

      // Refresh the requests list
      fetchMyRequests();
    } catch (err: any) {
      setError(
        err.message || "Failed to submit support request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      in_progress: {
        color: "bg-blue-100 text-blue-800",
        icon: AlertCircle,
        label: "In Progress",
      },
      resolved: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Resolved",
      },
      closed: {
        color: "bg-gray-100 text-gray-800",
        icon: CheckCircle,
        label: "Closed",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge
        className={`${config.color} flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1`}
      >
        <Icon className="w-2.5 h-2.5 md:w-3 md:h-3" />
        <span className="hidden sm:inline">{config.label}</span>
        <span className="sm:hidden">{config.label.split(" ")[0]}</span>
      </Badge>
    );
  };

  const shareUrl = "https://oiphd.macwealth.org";
  const shareText = "Check out this amazing course - An Evening with Jesus!";

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "instagram":
        // Instagram doesn't have a direct share URL, copy link instead
        navigator.clipboard.writeText(shareUrl);
        alert("Link copied! You can paste it in your Instagram post or story.");
        return;
      default:
        return;
    }

    window.open(url, "_blank", "width=600,height=400");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } catch {
      prompt("Copy this link:", shareUrl);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Settings & Support
        </h1>
        <p className="text-gray-600">
          Get help from our technical support team or share the course with
          friends.
        </p>
      </div>

      {/* Technical Support Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Technical Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Having issues or questions? Our technical support team is here to
            help!
          </p>

          <form onSubmit={handleSubmitSupport} className="space-y-4">
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Subject <span className="text-red-600">*</span>
              </label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full"
                required
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Message <span className="text-red-600">*</span>
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your issue or question in detail..."
                className="w-full resize-none"
                rows={6}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {submitted && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                ✓ Your support request has been submitted successfully! We'll
                get back to you soon.
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !subject.trim() || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Support Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            My Support Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRequests ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-3 text-sm text-gray-600">
                Loading your requests...
              </p>
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>You haven't submitted any support requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {myRequests.map((request) => (
                <Card key={request.id} className="border border-gray-200">
                  <CardContent className="pt-3 pb-3 px-3 md:pt-6 md:pb-6 md:px-6">
                    <div className="space-y-2 md:space-y-3">
                      {/* Header with subject and status */}
                      <div className="flex items-start justify-between gap-2 md:gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm md:text-lg text-gray-900 truncate">
                            {request.subject}
                          </h4>
                          <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">
                            {new Date(request.created_at).toLocaleDateString()}
                            <span className="hidden md:inline">
                              {" "}
                              at{" "}
                              {new Date(
                                request.created_at
                              ).toLocaleTimeString()}
                            </span>
                          </p>
                        </div>
                        <div className="shrink-0">
                          {getStatusBadge(request.status)}
                        </div>
                      </div>

                      {/* Your Message */}
                      <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                        <p className="text-[10px] md:text-xs font-semibold text-gray-700 mb-1">
                          Your Message:
                        </p>
                        <p className="text-xs md:text-sm text-gray-700 whitespace-pre-wrap line-clamp-3 md:line-clamp-none">
                          {request.message}
                        </p>
                      </div>

                      {/* Admin Response */}
                      {request.admin_response && (
                        <div className="bg-blue-50 p-2 md:p-3 rounded-lg border-l-2 md:border-l-4 border-blue-600">
                          <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                            <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-blue-600 shrink-0" />
                            <p className="text-[10px] md:text-xs font-semibold text-blue-900">
                              Admin Response
                              {request.responded_at && (
                                <span className="font-normal text-gray-600 ml-1 md:ml-2">
                                  •{" "}
                                  {new Date(
                                    request.responded_at
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </p>
                          </div>
                          <p className="text-xs md:text-sm text-gray-800 whitespace-pre-wrap">
                            {request.admin_response}
                          </p>
                        </div>
                      )}

                      {/* Waiting for response indicator */}
                      {!request.admin_response &&
                        request.status !== "closed" && (
                          <div className="bg-yellow-50 p-2 md:p-3 rounded-lg border-l-2 md:border-l-4 border-yellow-400">
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <Clock className="w-3 h-3 md:w-4 md:h-4 text-yellow-600 shrink-0" />
                              <p className="text-[10px] md:text-xs text-yellow-800">
                                {request.status === "in_progress"
                                  ? "Our team is working on your request..."
                                  : "Waiting for admin response..."}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Course Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Share This Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Spread the word! Share this life-changing course with your friends
            and family.
          </p>

          <div className="space-y-4">
            {/* Social Share Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare("facebook")}
                className="flex items-center justify-center gap-2 hover:bg-blue-50"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-sm">Facebook</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleShare("whatsapp")}
                className="flex items-center justify-center gap-2 hover:bg-green-50"
              >
                <svg className="w-5 h-5" fill="#25D366" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span className="text-sm">WhatsApp</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleShare("twitter")}
                className="flex items-center justify-center gap-2 hover:bg-sky-50"
              >
                <svg className="w-5 h-5" fill="#1DA1F2" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                <span className="text-sm">Twitter</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleShare("instagram")}
                className="flex items-center justify-center gap-2 hover:bg-pink-50"
              >
                <svg
                  className="w-5 h-5"
                  fill="url(#instagram-gradient)"
                  viewBox="0 0 24 24"
                >
                  <defs>
                    <linearGradient
                      id="instagram-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" style={{ stopColor: "#833AB4" }} />
                      <stop offset="50%" style={{ stopColor: "#FD1D1D" }} />
                      <stop offset="100%" style={{ stopColor: "#FCB045" }} />
                    </linearGradient>
                  </defs>
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
                <span className="text-sm">Instagram</span>
              </Button>
            </div>

            {/* Copy Link Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy Link
              </Button>
            </div>

            {/* Share Link Display */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Course Link:</p>
              <code className="text-sm text-blue-600 break-all">
                {shareUrl}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Info Section */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium capitalize">{user.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
