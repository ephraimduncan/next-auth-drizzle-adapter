import { foreignKey, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const Account = pgTable(
  "Account",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("userId").notNull(),
    type: varchar("type").notNull(),
    provider: varchar("provider").notNull(),
    providerAccountId: varchar("providerAccountId").notNull(),
    refresh_token: varchar("refresh_token"),
    access_token: varchar("access_token"),
    expires_at: timestamp("expires_at"),
    token_type: varchar("token_type"),
    scope: varchar("scope"),
    id_token: varchar("id_token"),
    session_state: varchar("session_state"),
  },
  (account) => {
    return {
      accountIdKeyIndex: uniqueIndex("Account_provider_providerAccountId_key").on(
        account.provider,
        account.providerAccountId
      ),

      userForeignKey: foreignKey({
        columns: [account.userId],
        foreignColumns: [User.id],
      }),
    };
  }
);

export const Session = pgTable(
  "Session",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionToken: varchar("sessionToken").notNull(),
    userId: varchar("userId").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (session) => {
    return {
      sessionTokenKeyIndex: uniqueIndex("Session_sessionToken_key").on(session.sessionToken),
      userForeignKey: foreignKey({
        columns: [session.userId],
        foreignColumns: [User.id],
      }),
    };
  }
);

export const User = pgTable(
  "User",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name"),
    email: varchar("email"),
    emailVerified: timestamp("emailVerified"),
    image: varchar("image"),
  },
  (user) => {
    return {
      userEmailKeyIndex: uniqueIndex("User_email_key").on(user.email),
    };
  }
);

export const VerificationToken = pgTable(
  "VerificationToken",
  {
    token: varchar("token").notNull(),
    identifier: varchar("identifier").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (verificationToken) => {
    return {
      tokenKeyIndex: uniqueIndex("VerificationToken_token_key").on(verificationToken.token),
      tokenIdentifierIndex: uniqueIndex("VerificationToken_identifier_key").on(
        verificationToken.identifier
      ),
    };
  }
);
