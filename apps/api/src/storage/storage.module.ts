import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { WorkspacesModule } from "src/workspaces/workspaces.module";
import { AssetsController } from "src/storage/assets.controller";
import { AssetsService } from "src/storage/assets.service";
import { createObjectStorageFromEnv } from "src/storage/create-object-storage";
import { OBJECT_STORAGE_TOKEN } from "src/storage/object-storage";

@Module({
  imports: [DatabaseModule, WorkspacesModule],
  controllers: [AssetsController],
  providers: [
    {
      provide: OBJECT_STORAGE_TOKEN,
      useFactory: createObjectStorageFromEnv,
    },
    AssetsService,
  ],
  exports: [OBJECT_STORAGE_TOKEN, AssetsService],
})
export class StorageModule {}
