import { Global, Module } from "@nestjs/common";
import { DATABASE_TOKEN } from "./database.constants";
import { db } from "@repo/db";

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useValue: db,
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
