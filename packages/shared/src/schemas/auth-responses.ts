export type AuthTokenData = {
  token: string;
};

export type SignOutData = {
  success: true;
};

export type SuccessData = {
  success: true;
};

export type SessionData = {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
};

export type AuthenticatedRequestHeaders = {
  Authorization: `Bearer ${string}`;
};
