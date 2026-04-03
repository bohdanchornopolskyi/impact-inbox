import { z } from "zod";
import { WORKSPACE_ROLES } from "../constants";

export const workspaceRoleSchema = z.enum(WORKSPACE_ROLES);
