import { HistoryNavigation } from "@/components/HistoryNavigation";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

interface BuildHeaderProps {
  templateId: string;
}

function BuildHeader({ templateId }: BuildHeaderProps) {
  return (
    <header className="h-[10vh] fixed z-[1] top-0 flex justify-between items-center px-2 w-full bg-sidebar border-b border-border">
      <Link href="/" className="flex items-center gap-2">
        <div className="text-xl font-bold">Impact Inbox</div>
      </Link>
      <div className="flex gap-2">
        <Link href={`/build/${templateId}/history`}>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        </Link>
        <HistoryNavigation />
      </div>
    </header>
  );
}

export default BuildHeader;
