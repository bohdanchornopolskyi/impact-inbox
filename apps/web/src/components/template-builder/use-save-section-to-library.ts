"use client";

import {
  isEmptyModuleSection,
  type CreateWorkspaceModuleInput,
} from "@repo/shared";
import { useWorkspace } from "@/contexts/workspace-context";
import { useToastMutation } from "@/lib/use-toast-mutation";
import { useCreateWorkspaceModule } from "@/lib/workspaces/workspace-hooks";
import { showError } from "@/stores/toast-store";
import { useBuilderStore } from "./builder-provider";
import {
  EMPTY_SECTION_SAVE_ERROR,
  resolveSelectedSection,
} from "./module-save-target";

export function useSaveSectionToLibrary() {
  const store = useBuilderStore();
  const { workspace } = useWorkspace();
  const createModule = useCreateWorkspaceModule(workspace.id);
  const create = useToastMutation({
    mutationFn: (input: CreateWorkspaceModuleInput) =>
      createModule.mutateAsync(input),
    successMessage: "Saved to module library",
    errorMessage: "Could not save module",
  });

  function saveSelectedSection(name: string, onSaved: () => void) {
    const { canEdit, content, selectedBlockId } = store.getState();
    const section = resolveSelectedSection(content, selectedBlockId);
    if (!canEdit || !name || !section) {
      return;
    }
    if (isEmptyModuleSection(section)) {
      showError(EMPTY_SECTION_SAVE_ERROR);
      return;
    }
    create.mutate({ name, content: section }, { onSuccess: onSaved });
  }

  return { saveSelectedSection, isPending: create.isPending };
}
