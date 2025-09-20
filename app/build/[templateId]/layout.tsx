import BuildHeader from "@/components/BuildHeader";
import { LeftSidebar } from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { BuilderStateProvider } from "@/app/build/BuilderStateProvider";
import { Id } from "@/convex/_generated/dataModel";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

const BuildPageLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { templateId: Id<"emailTemplates"> };
}) => {
  const { templateId } = await params;

  const templateData = await fetchQuery(
    api.emailTemplates.getById,
    {
      templateId,
    },
    {
      token: await convexAuthNextjsToken(),
    },
  );

  if (!templateData) {
    throw new Error("Template not found");
  }

  return (
    <ErrorBoundary>
      <BuilderStateProvider templateData={templateData} templateId={templateId}>
        <div className="flex flex-col h-screen w-full">
          <BuildHeader templateId={templateId} />
          <div className="flex">
            <LeftSidebar />
            {children}
            <RightSidebar />
          </div>
        </div>
      </BuilderStateProvider>
    </ErrorBoundary>
  );
};

export default BuildPageLayout;
