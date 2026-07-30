import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber } from "better-auth/plugins";

import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        // TODO(notifications module): send via WhatsApp/SMS provider instead of logging.
        console.log(`[auth] OTP for ${phoneNumber}: ${code}`);
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => `${phoneNumber.replace(/[^0-9a-zA-Z]/g, "")}@phone.greenbox.local`,
        getTempName: (phoneNumber) => phoneNumber,
      },
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        input: false,
      },
    },
  },
});
