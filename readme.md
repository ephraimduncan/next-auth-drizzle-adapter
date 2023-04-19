<p align="center">
  <br/>
  <a href="https://authjs.dev" target="_blank">
    <img height="64px" src="https://authjs.dev/img/logo/logo-sm.png" />
  </a>
  <a href="https://github.com/drizzle-team/drizzle-orm" target="_blank">
    <img height="64px" src="https://pbs.twimg.com/profile_images/1598308842391179266/CtXrfLnk_400x400.jpg"/>
  </a>
  <h3 align="center"><b>Drizzle ORM Adapter</b> - NextAuth.js / Auth.js</h3>
</p>

---

Check out the official adapter for Drizzle at [authjs.dev](https://authjs.dev/reference/adapter/drizzle).

## Installation

```bash
pnpm install next-auth drizzle-orm pg
pnpm install drizzle-kit --save-dev
```

## Setup

### Create a Drizzle instance

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: "YOUR_CONNECTION_STRING",
});

export const db = drizzle(pool);
```

### Add the adapter to your project.

Create an `adapters.ts` file in the project and add the contents of [./src/adapters.ts][adapters.ts].

### Add the adapter to your NextAuth.js config

```ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "./drizzle/adapters";
import { db } from "./client";

export default NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});
```

### Create the Drizzle schema from scratch

You'll need to create a database schema that includes the minimal schema for a `next-auth` adapter.

```ts
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
```

### Create a migration the database with `drizzle-kit`

```bash
$ drizzle-kit generate:pg --schema=src/schema.ts --breakpoints
```
