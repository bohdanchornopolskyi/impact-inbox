import { Plus } from "lucide-react";

function AddBlock() {
  return (
    <div className="max-w-xs cursor-pointer w-full flex items-center justify-center rounded-full bg-accent p-4 border border-border hover:bg-accent/80 transition-colors">
      <Plus className="h-5 w-5 " />
    </div>
  );
}

export default AddBlock;
