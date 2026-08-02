import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        input: false,
      },
      // Real phone number for CUSTOMER/DELIVERY_DRIVER accounts, which sign
      // in with phone + password instead of email + password. `email` still
      // holds a deterministic local address for those accounts — see
      // phoneToLocalEmail — since Better Auth's credential provider is
      // keyed by email either way.
      phoneNumber: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});
