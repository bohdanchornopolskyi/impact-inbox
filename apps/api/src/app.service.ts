import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { sql } from "drizzle-orm";
import type { Database } from "@repo/db";
import { DATABASE_TOKEN } from "src/database/database.constants";

@Injectable()
export class AppService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async getHealth(): Promise<{ ok: true }> {
    try {
      await this.db.execute(sql`SELECT 1`);
      return { ok: true };
    } catch {
      throw new ServiceUnavailableException("Database unavailable");
    }
  }
}
