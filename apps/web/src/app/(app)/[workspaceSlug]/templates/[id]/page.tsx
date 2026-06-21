import { TemplateBuilderView } from "@/components/template-builder/template-builder-view";

type TemplateBuilderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TemplateBuilderPage({
  params,
}: TemplateBuilderPageProps) {
  const { id } = await params;

  return <TemplateBuilderView templateId={id} />;
}
