import Link from "next/link";

export default function WorkspaceNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-ui-2xl font-semibold text-text-primary">
        Workspace not found
      </h1>
      <p className="max-w-md text-ui-sm text-text-secondary">
        This workspace does not exist or you do not have access to it.
      </p>
      <Link
        href="/"
        className="text-ui-sm font-medium text-text-primary underline-offset-4 hover:underline"
      >
        Back to home
      </Link>
    </div>
  );
}
