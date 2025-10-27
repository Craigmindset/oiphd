"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth-context";

export function Transformation() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [rating, setRating] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!subject.trim() || !before.trim() || !after.trim() || !rating) return;
    setLoading(true);
    // Get user id from internal auth context
    if (!user || !user.id) {
      setLoading(false);
      setError("You must be logged in to submit your testimony.");
      return;
    }
    const user_id = user.id;
    const { error } = await supabase.from("transformation").insert([
      {
        user_id,
        subject,
        before,
        after,
        rating,
        date_created: new Date().toISOString(),
      },
    ]);
    setLoading(false);
    if (!error) {
      setSubmitted(true);
      setSubject("");
      setBefore("");
      setAfter("");
      setRating("");
      setTimeout(() => setSubmitted(false), 2000);
    } else {
      setError("Submission failed. Please try again.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Transformation</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Share Your Testimony</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Subject
              </label>
              <input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject of your testimony"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label
                htmlFor="before"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Before Evening with Jesus{" "}
                <span className="text-red-600">*</span>
              </label>
              <textarea
                id="before"
                value={before}
                onChange={(e) => setBefore(e.target.value)}
                placeholder="Describe your experience before..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                required
              />
            </div>
            <div>
              <label
                htmlFor="after"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Experience After Evening with Jesus{" "}
                <span className="text-red-600">*</span>
              </label>
              <textarea
                id="after"
                value={after}
                onChange={(e) => setAfter(e.target.value)}
                placeholder="Describe your experience after..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                required
              />
            </div>
            <div>
              <label
                htmlFor="rating"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                How would you rate the experience?
              </label>
              <select
                id="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select rating</option>
                <option value="Excellent">Excellent</option>
                <option value="Very Good">Very Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button
              type="submit"
              disabled={
                loading ||
                !subject.trim() ||
                !before.trim() ||
                !after.trim() ||
                !rating
              }
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
          {submitted && (
            <div className="mt-4 text-green-600 font-semibold text-center">
              Submitted successfully!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
