export type User = {
  id: number;
  email: string;
  name?: string | null;
  picture?: string | null;
  role?: UserRole;

  //Audit fields
  isActive: boolean;
  createdOn: string;
  modifiedOn: string;
};

export enum UserRole {
  USER_OWNER = "USER_OWNER",
  ADMIN = "ADMIN",
}
