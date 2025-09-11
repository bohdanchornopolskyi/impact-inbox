import BuildHeader from "@/components/BuildHeader";
import { LeftSidebar } from "@/components/LeftSidebar";
import { BuilderStateProvider } from "@/app/build/BuilderStateProvider";
import { Id } from "@/convex/_generated/dataModel";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const BuildPageLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { templateId: Id<"emailTemplates"> };
}) => {
  const { templateId } = await params;
  return (
    <ErrorBoundary>
      <BuilderStateProvider templateId={templateId}>
        <div className="flex flex-col h-screen w-full">
          <BuildHeader templateId={templateId} />
          <div className="flex">
            <LeftSidebar />
            {children}
          </div>
        </div>
      </BuilderStateProvider>
    </ErrorBoundary>
  );
};

export default BuildPageLayout;
