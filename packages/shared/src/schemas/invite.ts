import { z } from "zod";
import { passwordSchema } from "./auth";
import { organizationRoleSchema } from "./organization";
import { workspaceRoleSchema } from "./workspace";
import { organizationMemberSchema } from "./organization";
import { workspaceMemberSchema } from "./workspace";

export const inviteSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  organizationId: z.string().uuid(),
  organizationRole: organizationRoleSchema,
  workspaceId: z.string().uuid().nullable(),
  workspaceRole: workspaceRoleSchema.nullable(),
  invitedByUserId: z.string().uuid(),
  expiresAt: z.coerce.date(),
  acceptedAt: z.coerce.date().nullable(),
  revokedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  expired: z.boolean(),
});

export const invitePreviewSchema = z.object({
  email: z.string().email(),
  organizationName: z.string(),
  organizationRole: organizationRoleSchema,
  workspaceName: z.string().nullable(),
  workspaceRole: workspaceRoleSchema.nullable(),
  expired: z.boolean(),
  revoked: z.boolean(),
  accepted: z.boolean(),
});

export const inviteAcceptSchema = z
  .object({
    token: z.string().uuid(),
    name: z.string().min(1).optional(),
    password: passwordSchema.optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const wantsSignUp =
      data.name !== undefined ||
      data.password !== undefined ||
      data.confirmPassword !== undefined;

    if (!wantsSignUp) {
      return;
    }

    if (!data.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name is required",
        path: ["name"],
      });
    }

    if (!data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required",
        path: ["password"],
      });
    }

    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const inviteAcceptResultSchema = z.object({
  success: z.literal(true),
  token: z.string().uuid().optional(),
});

export const organizationMemberInviteResultSchema = z.discriminatedUnion(
  "status",
  [
    z.object({
      status: z.literal("member"),
      member: organizationMemberSchema,
    }),
    z.object({
      status: z.literal("pending_invite"),
      invite: inviteSchema,
    }),
  ],
);

export const workspaceMemberInviteResultSchema = z.discriminatedUnion(
  "status",
  [
    z.object({
      status: z.literal("member"),
      member: workspaceMemberSchema,
    }),
    z.object({
      status: z.literal("pending_invite"),
      invite: inviteSchema,
    }),
  ],
);

export const inviteAcceptSignUpFormSchema = z
  .object({
    name: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const inviteAcceptSignInFormSchema = z.object({
  password: z.string().min(1),
});

export type InviteData = z.infer<typeof inviteSchema>;
export type InvitePreviewData = z.infer<typeof invitePreviewSchema>;
export type InviteAcceptInput = z.infer<typeof inviteAcceptSchema>;
export type InviteAcceptResultData = z.infer<typeof inviteAcceptResultSchema>;
export type OrganizationMemberInviteResultData = z.infer<
  typeof organizationMemberInviteResultSchema
>;
export type WorkspaceMemberInviteResultData = z.infer<
  typeof workspaceMemberInviteResultSchema
>;
export type InviteAcceptSignUpFormInput = z.infer<
  typeof inviteAcceptSignUpFormSchema
>;
export type InviteAcceptSignInFormInput = z.infer<
  typeof inviteAcceptSignInFormSchema
>;
