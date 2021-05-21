export interface IAuthUser {
  refresh_token: string;
  access_token: string;
  displayName: string;
  avatar: string;
  roles: string[] | null;
}
