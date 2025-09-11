"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { HistoryItem } from "./HistoryItem";
import { Button } from "@/components/ui/button";
import { Clock, RotateCcw } from "lucide-react";

interface Snapshot {
  _id: Id<"templateSnapshots">;
  templateId: Id<"emailTemplates">;
  content: any[];
  version: number;
  createdAt: number;
}

interface HistoryListProps {
  snapshots: Snapshot[];
  onRestore: (
    snapshotId: Id<"templateSnapshots">,
    content: any[],
  ) => Promise<void>;
  templateId: string;
}

export function HistoryList({
  snapshots,
  onRestore,
  templateId,
}: HistoryListProps) {
  const [selectedSnapshot, setSelectedSnapshot] =
    useState<Id<"templateSnapshots"> | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async (
    snapshotId: Id<"templateSnapshots">,
    content: any[],
  ) => {
    setIsRestoring(true);
    try {
      await onRestore(snapshotId, content);
      setSelectedSnapshot(null);
    } catch (error) {
      console.error("Failed to restore snapshot:", error);
    } finally {
      setIsRestoring(false);
    }
  };

  if (snapshots.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No History Yet
        </h3>
        <p className="text-gray-600 mb-4">
          Start editing your template to create version history.
        </p>
        <Button asChild>
          <a href={`/build/${templateId}`}>Start Editing</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {snapshots.length} Version{snapshots.length !== 1 ? "s" : ""}
        </h2>
        {selectedSnapshot && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSnapshot(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const snapshot = snapshots.find(
                  (s) => s._id === selectedSnapshot,
                );
                if (snapshot) {
                  handleRestore(snapshot._id, snapshot.content);
                }
              }}
              disabled={isRestoring}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isRestoring ? "Restoring..." : "Restore This Version"}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {snapshots.map((snapshot, index) => (
          <HistoryItem
            key={snapshot._id}
            snapshot={snapshot}
            isSelected={selectedSnapshot === snapshot._id}
            isLatest={index === 0}
            onSelect={() => setSelectedSnapshot(snapshot._id)}
            onRestore={() => handleRestore(snapshot._id, snapshot.content)}
            isRestoring={isRestoring}
          />
        ))}
      </div>
    </div>
  );
}
