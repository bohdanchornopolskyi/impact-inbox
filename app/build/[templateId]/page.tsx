import AddBlock from "@/components/AddBlock";
import TemplateCanvas from "@/components/TemplateCanvas";

function Builder() {
  return (
    <div className="h-screen w-full mt-[10vh] p-4 flex flex-col items-center">
      <AddBlock />
      <TemplateCanvas />
    </div>
  );
}

export default Builder;
