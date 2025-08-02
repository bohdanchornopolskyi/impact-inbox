import Link from "next/link";
import React from "react";

function BuildHeader() {
  return (
    <header className="h-[10vh] fixed top-0 flex justify-between items-center px-2 w-full bg-sidebar border-b border-border">
      <Link href="/" className="flex items-center gap-2">
        <div className="text-xl font-bold">Impact Inbox</div>
      </Link>
      <div className="flex gap-2"></div>
    </header>
  );
}

export default BuildHeader;
