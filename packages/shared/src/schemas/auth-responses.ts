export type AuthTokenData = {
  token: string;
};

export type SignOutData = {
  success: true;
};

export type AuthenticatedRequestHeaders = {
  Authorization: `Bearer ${string}`;
};
