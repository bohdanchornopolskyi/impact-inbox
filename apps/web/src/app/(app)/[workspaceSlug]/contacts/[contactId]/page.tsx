import { ContactDetailView } from "@/components/contacts/contact-detail-view";

type PageProps = {
  params: Promise<{ contactId: string }>;
};

export default async function ContactDetailPage({ params }: PageProps) {
  const { contactId } = await params;
  return <ContactDetailView contactId={contactId} />;
}
