"use client";

import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Clock, RotateCcw, CheckCircle, ChevronDown } from "lucide-react";
import { AnyBlock, HistoryAction } from "@/lib/types";
import { Snapshot } from "@/lib/types";

interface HistoryItemProps {
  snapshot: Snapshot;
  isSelected: boolean;
  isLatest: boolean;
  onSelect: () => void;
  onRestore: () => void;
  isRestoring: boolean;
}

export function HistoryItem({
  snapshot,
  isSelected,
  isLatest,
  onSelect,
  onRestore,
  isRestoring,
}: HistoryItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBlockCount = () => {
    return snapshot.content?.length || 0;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
        }`}
        onClick={onSelect}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-gray-900">
                Version {snapshot.version}
              </h3>
              {isLatest && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Latest
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDate(snapshot.createdAt)}
              </div>
              <div>
                {getBlockCount()} block{getBlockCount() !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {snapshot.content?.length > 0 ? (
                <span>
                  Contains {snapshot.content.length} block
                  {snapshot.content.length !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-gray-400">Empty template</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <CollapsibleTrigger
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
            >
              Actions
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
            {isSelected && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore();
                }}
                disabled={isRestoring}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {isRestoring ? "Restoring..." : "Restore"}
              </Button>
            )}
          </div>
        </div>

        <CollapsibleContent onClick={(e) => e.stopPropagation()}>
          <div className="mt-3 rounded-md border bg-white">
            {isOpen ? <SnapshotActionsList snapshotId={snapshot._id} /> : null}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function SnapshotActionsList({
  snapshotId,
}: {
  snapshotId: Id<"templateSnapshots">;
}) {
  const actions = useQuery(api.history.getActionsForSnapshot, {
    snapshotId,
  });

  if (actions === undefined) {
    return <div className="p-3 text-sm text-gray-600">Loading actions...</div>;
  }

  if (!actions.length) {
    return (
      <div className="p-3 text-sm text-gray-500">No actions recorded.</div>
    );
  }

  return (
    <ul className="divide-y">
      {actions.map((entry) => {
        const action = entry.action as HistoryAction;
        const time = new Date(entry.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <li key={entry._id} className="p-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="uppercase">
                  {action.type.replace("_", " ")}
                </Badge>
                <span className="text-gray-800">{summarizeAction(action)}</span>
              </div>
              <span className="text-gray-500">{time}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function summarizeAction(action: HistoryAction): string {
  switch (action.type) {
    case "ADD_BLOCK":
      return `Added block to ${action.payload.parentId} at ${action.payload.index}`;
    case "UPDATE_STYLE":
      return `Updated styles of ${action.payload.blockId}`;
    case "UPDATE_CONTENT":
      return `Updated content of ${action.payload.blockId}`;
    case "DELETE_BLOCK":
      return `Deleted block ${action.payload.blockId}`;
    case "MOVE_BLOCK":
      return `Moved ${action.payload.blockId} to ${action.payload.newParentId} at ${action.payload.newIndex}`;
    default:
      return "Performed action";
  }
}
