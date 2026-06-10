export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface GetUserParams {
  id: string;
}

export interface CreateUser {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
}
