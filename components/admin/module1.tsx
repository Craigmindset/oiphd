"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Module1Admin() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editCard, setEditCard] = useState<any | null>(null);
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

  const handleEdit = (card: any) => {
    setEditCard(card);
    setEditTitle(card.title);
    setEditContent(card.content);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCard) return;

    setEditLoading(true);
    const { error } = await supabase
      .from("module_content")
      .update({ title: editTitle, content: editContent })
      .eq("id", editCard.id);

    setEditLoading(false);

    if (!error) {
      setEditCard(null);
      setEditTitle("");
      setEditContent("");
      fetchCards();
    }
  };

  const handleCancelEdit = () => {
    setEditCard(null);
    setEditTitle("");
    setEditContent("");
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <Card
            key={card.id || card.item_number}
            className="border-blue-400 border-2"
          >
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 font-semibold">Item: {card.item_number}</div>
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
                  onClick={() => handleEdit(card)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this card?")) {
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog
        open={editCard !== null}
        onOpenChange={(open) => !open && handleCancelEdit()}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Item Number
              </label>
              <Input
                value={editCard?.item_number || ""}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <p className="text-xs text-gray-500 mb-2">
                You can use HTML tags like{" "}
                <code className="bg-gray-100 px-1 rounded">&lt;b&gt;</code>,{" "}
                <code className="bg-gray-100 px-1 rounded">&lt;strong&gt;</code>
                , <code className="bg-gray-100 px-1 rounded">&lt;em&gt;</code>,{" "}
                <code className="bg-gray-100 px-1 rounded">&lt;i&gt;</code>,{" "}
                <code className="bg-gray-100 px-1 rounded">&lt;u&gt;</code>,{" "}
                <code className="bg-gray-100 px-1 rounded">&lt;br&gt;</code> for
                formatting
              </p>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Enter content (HTML tags supported)"
                rows={12}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
