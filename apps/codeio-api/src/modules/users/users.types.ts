export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface GetUserParams {
  id: string;
}
