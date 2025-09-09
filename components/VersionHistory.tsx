"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useBuilder } from "@/app/build/BuilderContext";
import { Button } from "@/components/ui/button";
import { Doc } from "@/convex/_generated/dataModel";

export function VersionHistory() {
  const params = useParams();
  const templateId = params.templateId as Id<"emailTemplates">;

  const snapshots = useQuery(api.history.getSnapshotsForTemplate, {
    templateId,
  });
  const { dispatch } = useBuilder();

  const handleRestore = (snapshot: Doc<"templateSnapshots">) => {
    dispatch({
      type: "RESTORE_SNAPSHOT",
      payload: {
        blocks: snapshot.content,
      },
    });
  };

  return (
    <div className="p-4">
      <h3 className="font-bold mb-2">Version History</h3>
      <div className="space-y-2">
        {snapshots?.map((snapshot) => (
          <div
            key={snapshot._id}
            className="flex justify-between items-center p-2 border rounded-md"
          >
            <div>
              <p className="text-sm font-medium">
                Saved on: {new Date(snapshot.createdAt).toLocaleString()}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRestore(snapshot)}
            >
              Restore
            </Button>
          </div>
        ))}
        {snapshots?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No saved versions found.
          </p>
        )}
      </div>
    </div>
  );
}
