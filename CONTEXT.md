# Impact Inbox

Email template platform with workspace-scoped templates, session auth, and shared domain schemas across API, web, and renderer.

## Language

**Session user**:
The authenticated identity on an HTTP request, typed as `UserProfileData`. Mapped at the auth seam — never a DB row type.
_Avoid_: Current user row, UsersSelect on request

**Workspace context**:
Resolved workspace + caller role for a guarded route, typed as `AuthenticatedWorkspaceContext`. Produced by `WorkspaceAccessService`.
_Avoid_: Workspace on request as Drizzle row, guard-owned queries

**Block type**:
A discriminator in the template content tree (e.g. `heading`, `button`). Schema lives in `@repo/shared`; render dispatch lives in `@repo/email-renderer` registry.
_Avoid_: Switch-per-file block handling without registry entry

**Auth seam**:
Where session tokens become `Session user` on the request. Only place DB user rows map to shared profile types.
_Avoid_: Per-controller user mapping

**Workspace access**:
Membership resolution + role comparison for a workspace id and user id. Single module — guards and services call the same interface.
_Avoid_: Duplicate membership queries in guard and service
