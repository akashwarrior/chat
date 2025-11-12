import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react

const authClient = createAuthClient({
  //you can pass client configuration here
});

export const {
  useSession,
  signIn,
  signOut,
  listSessions,
  revokeSession,
  deleteUser,
} = authClient;
