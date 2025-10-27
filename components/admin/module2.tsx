"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Module2Admin() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const fetchCards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("module_content")
      .select("id, item_number, title, content, content_type")
      .eq("content_type", "audio")
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
      <h1 className="text-2xl font-bold mb-6">Module 2: Audio Content</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {cards.length === 0 && !loading && <div>No content found.</div>}
      <div className="space-y-6">
        {cards.map((card, idx) => (
          <Card
            key={card.id || card.item_number}
            className="border-green-400 border-2 p-2 min-h-0"
          >
            <CardContent>
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
                  <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Audio URL"
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
                  <audio controls src={card.content} className="w-full mb-2" />
                  <div className="flex items-center gap-2 mb-2 justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500">
                        Item: {card.item_number}
                      </span>
                      <CardTitle className="text-sm m-0 p-0">
                        {editIndex === idx ? "Edit Card" : card.title}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
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
                            confirm(
                              "Are you sure you want to delete this card?"
                            )
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
