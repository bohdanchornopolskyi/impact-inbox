import { CreateTemplateModal } from "@/components/CreateTemplateModal";
import { TemplateNotFound } from "@/components/TemplateNotFound";

import { TemplatesList } from "@/components/TemplatesList";

export default function TemplatesDashboardPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Your Templates</h1>
        <CreateTemplateModal />
        <TemplatesList />
      </div>
      <TemplateNotFound />
    </>
  );
}
