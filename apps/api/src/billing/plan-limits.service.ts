import { Injectable } from "@nestjs/common";

@Injectable()
export class PlanLimitsService {
  /**
   * Enforces the monthly export cap for an organization.
   *
   * Contract:
   * - Throws `ForbiddenException` (HTTP 403) when the organization is over its
   *   export cap.
   * - Returns/resolves (void) when the export is allowed.
   *
   * Callers should treat a normal resolution as "allowed" and need not inspect
   * a return value.
   *
   * NOTE: this is a stub that currently allows all exports. Real metering wires
   * in once billing meters ship (Phase 6); behavior here must not change until
   * then.
   */
  async canExport(_organizationId: string): Promise<void> {
    return;
  }
}
