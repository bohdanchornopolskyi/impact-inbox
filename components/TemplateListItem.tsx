import Link from "next/link";

function TemplateListItem({ id, name }: { id: string; name: string }) {
  return (
    <div className="p-2 border rounded-md">
      <Link href={`/build/${id}`}>{name}</Link>
    </div>
  );
}

export default TemplateListItem;
