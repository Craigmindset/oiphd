"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Module1Admin() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);
  // Helper to check if content is expanded
  const isExpanded = (idx: number) => expandedIndexes.includes(idx);
  // Toggle expand/collapse for a card
  const toggleExpand = (idx: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("module_content")
      .select("id, item_number, title, content, content_type")
      .eq("content_type", "text")
      .order("item_number", { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setCards(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 px-2 md:px-8">
      <h1 className="text-2xl font-bold mb-6">Module 1: Text Content</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {cards.length === 0 && !loading && <div>No content found.</div>}
      <div className="space-y-6">
        {cards.map((card, idx) => (
          <Card
            key={card.id || card.item_number}
            className="border-blue-400 border-2"
          >
            <CardHeader>
              <CardTitle>
                {editIndex === idx ? "Edit Card" : card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 font-semibold">Item: {card.item_number}</div>
              {editIndex === idx ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setEditLoading(true);
                    const { error } = await supabase
                      .from("module_content")
                      .update({ title: editTitle, content: editContent })
                      .eq("id", card.id);
                    setEditLoading(false);
                    setEditIndex(null);
                    setEditTitle("");
                    setEditContent("");
                    fetchCards();
                  }}
                  className="space-y-2"
                >
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                    className="mb-2"
                  />
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Content"
                    rows={6}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button type="submit" disabled={editLoading}>
                      {editLoading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditIndex(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="whitespace-pre-line mb-2">
                    {isExpanded(idx)
                      ? card.content
                      : card.content.length > 180
                      ? card.content.slice(0, 180) + "..."
                      : card.content}
                  </div>
                  {card.content.length > 180 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="px-2 py-0 h-7 text-xs mb-2"
                      onClick={() => toggleExpand(idx)}
                    >
                      {isExpanded(idx) ? "Show Less" : "Show More"}
                    </Button>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditIndex(idx);
                        setEditTitle(card.title);
                        setEditContent(card.content);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (
                          confirm("Are you sure you want to delete this card?")
                        ) {
                          await supabase
                            .from("module_content")
                            .delete()
                            .eq("id", card.id);
                          fetchCards();
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
