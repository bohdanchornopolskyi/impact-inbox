"use client";

import { useParams } from "next/navigation";
import { useTemplateHistory } from "@/hooks/useTemplateHistory";
import { HistoryList } from "@/components/HistoryList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const params = useParams();
  const templateId = params.templateId as string;

  const { snapshots, isLoading, error, restoreToSnapshot } =
    useTemplateHistory(templateId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading history: {error}</p>
          <Link href={`/build/${templateId}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full mt-[10vh]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Template History
            </h1>
            <p className="text-gray-600">
              View and restore previous versions of your template
            </p>
          </div>
          <Link href={`/build/${templateId}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
          </Link>
        </div>

        <HistoryList
          snapshots={snapshots}
          onRestore={restoreToSnapshot}
          templateId={templateId}
        />
      </div>
    </div>
  );
}
