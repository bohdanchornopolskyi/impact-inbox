import { ContactListDetailView } from "@/components/contacts/contact-list-detail-view";

type PageProps = {
  params: Promise<{ listId: string }>;
};

export default async function ContactListDetailPage({ params }: PageProps) {
  const { listId } = await params;
  return <ContactListDetailView listId={listId} />;
}
