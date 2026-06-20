# Consolidate workspace access in one module

Workspace membership resolution and role checks live in `WorkspaceAccessService`. `WorkspaceGuard` and `WorkspacesService` both call it — guards do not query Drizzle directly. Resolved context is stored on the request as `AuthenticatedWorkspaceContext` (`@repo/shared`).

**Considered:** Keep guard as inline repository. Rejected — duplicates `getMembership` / `getWorkspaceById`, doubles DB round trips on guarded routes.

**Consequences:** `WorkspaceGuard` only enforces `@WorkspaceRoles()` after resolve. `getWorkspaceForUser` reuses the same resolve path when context is not already on the request. Org-level membership is a separate layer (see ADR 0006); workspace access still resolves within an organization the user belongs to.
