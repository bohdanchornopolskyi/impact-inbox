# Map identity at the auth seam

HTTP handlers must never depend on `@repo/db` row types. `Express.Request.user` carries `UserProfileData` from `@repo/shared`, mapped once in `AuthGuard` after `SessionsService.validateSession`. Services that need full persistence rows fetch them via `UsersService` by id — not from `request.user`.

**Considered:** Keep `UsersSelect` on the request for convenience. Rejected — column renames and internal fields leak into every controller.

**Consequences:** `CurrentUser()` decorator returns `UserProfileData`. Credential and lifecycle flows that need password hashes continue to load accounts/users through services, not the request.
