import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { User, Account, Session, VerificationToken } from "./schema";
import { InferModel } from "drizzle-orm";
import { eq } from "drizzle-orm/expressions";

export type TUser = InferModel<typeof User, "insert">;
export type TAccount = InferModel<typeof Account, "insert">;
export type TSession = InferModel<typeof Session, "insert">;
export type TVerificationToken = InferModel<typeof VerificationToken, "insert">;

export default function DrizzleAdapter(db: NodePgDatabase) {
  return {
    async createUser(user: TUser) {
      const insertedUsers = await db
        .insert(User)
        .values({ ...user })
        .returning();

      return insertedUsers[0];
    },

    async getUser(id: string) {
      const user = await db.select().from(User).where(eq(User.id, id));
      return user[0];
    },

    async getUserByEmail(email: string) {
      const user = await db.select().from(User).where(eq(User.email, email));
      return user[0];
    },

    async getUserByAccount(provider_providerAccountId: string) {
      const user = await db
        .select()
        .from(Account)
        .where(eq(Account.providerAccountId, provider_providerAccountId));
      return user[0];
    },

    async updateUser(id: string, data: TUser) {
      const updatedUsers = await db.update(User).set(data).where(eq(User.id, id)).returning();
      return updatedUsers[0];
    },

    async deleteUser(id: string) {
      const deletedUsers = await db.delete(User).where(eq(User.id, id)).returning();
      return deletedUsers[0];
    },

    async linkAccount(data: TAccount) {
      const insertedAccounts = await db.insert(Account).values(data).returning();
      return insertedAccounts[0];
    },

    async unlinkAccount(provider_providerAccountId: string) {
      const deletedAccounts = await db
        .delete(Account)
        .where(eq(Account.providerAccountId, provider_providerAccountId))
        .returning();
      return deletedAccounts[0];
    },

    async getSessionAndUser(sessionToken: string) {
      const session = await db.select().from(Session).where(eq(Session.sessionToken, sessionToken));
      if (!session[0]) return null;

      const user = await db.select().from(User).where(eq(User.id, session[0].userId));
      return { user: user[0], session: session[0] };
    },

    async createSession(data: TSession) {
      const insertedSessions = await db.insert(Session).values(data).returning();
      return insertedSessions[0];
    },

    async updateSession(sessionToken: string, data: TSession) {
      const updatedSessions = await db
        .update(Session)
        .set(data)
        .where(eq(Session.sessionToken, sessionToken))
        .returning();
      return updatedSessions[0];
    },

    async deleteSession(sessionToken: string) {
      const deletedSessions = await db
        .delete(Session)
        .where(eq(Session.sessionToken, sessionToken))
        .returning();
      return deletedSessions[0];
    },

    async createVerificationToken(data: TVerificationToken) {
      const insertedVerificationTokens = await db
        .insert(VerificationToken)
        .values(data)
        .returning();
      return insertedVerificationTokens[0];
    },

    async useVerificationToken(identifier_token: string) {
      const deletedVerificationTokens = await db
        .delete(VerificationToken)
        .where(eq(VerificationToken.identifier, identifier_token))
        .returning();
      return deletedVerificationTokens[0];
    },
  };
}
