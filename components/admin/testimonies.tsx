"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

interface Testimony {
  id: string;
  user_id: string;
  subject: string;
  before: string;
  after: string;
  rating: number;
  date_created: string;
  user_profiles?:
    | { first_name: string | null; last_name: string | null }[]
    | null;
}

export default function Testimonies() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [userMap, setUserMap] = useState<
    Record<string, { first_name: string | null; last_name: string | null }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      // Fetch testimonies
      const { data: testimoniesData, error: testimoniesError } = await supabase
        .from("transformation")
        .select("id, user_id, subject, before, after, rating, date_created")
        .order("date_created", { ascending: false });
      if (testimoniesError) {
        setError(testimoniesError.message);
        setLoading(false);
        return;
      }
      setTestimonies(testimoniesData || []);

      // Fetch all user_profiles
      const { data: usersData, error: usersError } = await supabase
        .from("user_profiles")
        .select("id, first_name, last_name");
      if (usersError) {
        setError(usersError.message);
        setLoading(false);
        return;
      }
      // Map user_id to user name
      const userMap: Record<
        string,
        { first_name: string | null; last_name: string | null }
      > = {};
      usersData?.forEach((u: any) => {
        userMap[u.id] = { first_name: u.first_name, last_name: u.last_name };
      });
      setUserMap(userMap);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Testimonies</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : testimonies.length === 0 ? (
        <div>No testimonies found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">S/N</th>
                <th className="px-4 py-2 border">User</th>
                <th className="px-4 py-2 border">Subject</th>
                <th className="px-4 py-2 border">Before Evening with Jesus</th>
                <th className="px-4 py-2 border">My experience</th>
                <th className="px-4 py-2 border">Rating</th>
                <th className="px-4 py-2 border">Date Created</th>
              </tr>
            </thead>
            <tbody>
              {testimonies.map((t, idx) => (
                <tr key={t.id} className="border-b">
                  <td className="px-4 py-2 border">{idx + 1}</td>
                  <td className="px-4 py-2 border">
                    {userMap[t.user_id]?.first_name || ""}{" "}
                    {userMap[t.user_id]?.last_name || ""}
                  </td>
                  <td className="px-4 py-2 border">{t.subject}</td>
                  <td className="px-4 py-2 border">{t.before}</td>
                  <td className="px-4 py-2 border">{t.after}</td>
                  <td className="px-4 py-2 border">{t.rating}</td>
                  <td className="px-4 py-2 border">
                    {new Date(t.date_created).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
