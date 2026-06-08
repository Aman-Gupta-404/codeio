import { User } from "./users.types";

const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Jane Doe",
    email: "jane@example.com",
    createdAt: new Date(),
  },
];

export const getUserById = async (
  id: string
): Promise<User | null> => {
  const user = users.find((u) => u.id === id);

  return user || null;
};