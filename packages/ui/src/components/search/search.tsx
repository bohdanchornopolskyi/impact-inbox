import { Search as SearchIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { Input, type InputProps } from "../input/input";

const searchIcon = <SearchIcon strokeWidth={1.5} />;

export type SearchProps = Omit<InputProps, "type" | "leadingIcon">;

export function Search({ className, ...props }: SearchProps) {
  return (
    <Input
      {...props}
      type="search"
      leadingIcon={searchIcon}
      className={cn("pl-2", className)}
    />
  );
}
