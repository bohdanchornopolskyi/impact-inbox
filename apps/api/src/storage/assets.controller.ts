import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ASSET_UPLOAD_MAX_BYTES,
  type AuthenticatedWorkspaceContext,
  type OrganizationAssetData,
  type OrganizationAssetUsageData,
} from "@repo/shared";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { CurrentWorkspace } from "src/workspaces/decorators/current-workspace.decorator";
import { WorkspaceRoles } from "src/workspaces/decorators/workspace-roles.decorator";
import { WorkspaceGuard } from "src/workspaces/guards/workspace.guard";
import { UpdateOrganizationAssetDto } from "src/storage/dto/assets.dto";
import { AssetsService } from "src/storage/assets.service";

@Controller("workspaces/:id")
@UseGuards(WorkspaceGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get("assets")
  listAssets(
    @CurrentWorkspace() context: AuthenticatedWorkspaceContext,
  ): Promise<OrganizationAssetData[]> {
    return this.assetsService.listAssets(context);
  }

  @Post("assets")
  @WorkspaceRoles("admin", "owner")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: ASSET_UPLOAD_MAX_BYTES },
    }),
  )
  uploadAsset(
    @CurrentWorkspace() context: AuthenticatedWorkspaceContext,
    @CurrentUser() user: { id: string },
    @UploadedFile()
    file:
      | {
          buffer: Buffer;
          size: number;
          mimetype: string;
          originalname?: string;
        }
      | undefined,
  ): Promise<OrganizationAssetData> {
    return this.assetsService.uploadImage(context, user.id, file);
  }

  @Get("assets/:assetId/usage")
  getAssetUsage(
    @CurrentWorkspace() context: AuthenticatedWorkspaceContext,
    @Param("assetId") assetId: string,
  ): Promise<OrganizationAssetUsageData> {
    return this.assetsService.getAssetUsage(context, assetId);
  }

  @Patch("assets/:assetId")
  @WorkspaceRoles("admin", "owner")
  updateAsset(
    @CurrentWorkspace() context: AuthenticatedWorkspaceContext,
    @Param("assetId") assetId: string,
    @Body() dto: UpdateOrganizationAssetDto,
  ): Promise<OrganizationAssetData> {
    return this.assetsService.updateAsset(context, assetId, dto);
  }

  @Delete("assets/:assetId")
  @WorkspaceRoles("admin", "owner")
  async deleteAsset(
    @CurrentWorkspace() context: AuthenticatedWorkspaceContext,
    @Param("assetId") assetId: string,
  ): Promise<{ success: true }> {
    await this.assetsService.deleteAsset(context, assetId);
    return { success: true };
  }
}
