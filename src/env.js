import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    SAGE_URL: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number().int(),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
    SMTP_FROM: z.string(),
    ARCHIVE_PATH: z.string(),
    UPLOADTHING_TOKEN: z.string(),
    UPLOADTHING_URL: z.string(),
    UPLOADTHING_SECRET: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SAGE_URL: process.env.SAGE_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    NODE_ENV: process.env.NODE_ENV,
    ARCHIVE_PATH: process.env.ARCHIVE_PATH,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    UPLOADTHING_URL: process.env.UPLOADTHING_URL,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,

    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
