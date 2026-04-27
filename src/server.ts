import "dotenv/config";
import express from "express";
import { z } from "zod";
import { createTwilioRouter } from "./routes/twilio";

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  BASE_URL: z.string().url().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  SCOPE_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.65),
});

export type Env = z.infer<typeof EnvSchema> & { BASE_URL: string };

function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  const { BASE_URL, ...rest } = parsed.data;
  const port = rest.PORT;
  return {
    ...rest,
    BASE_URL: BASE_URL ?? `http://localhost:${port}`
  };
}

async function main() {
  const env = loadEnv();
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.get("/healthz", (_req, res) => res.json({ ok: true }));

  app.use("/voice", createTwilioRouter(env));

  app.listen(env.PORT, () => {
    console.log(`Server listening on http://localhost:${env.PORT}`);
    console.log(`Twilio incoming webhook: ${env.BASE_URL}/voice/incoming`);
    console.log(`Twilio handle webhook:   ${env.BASE_URL}/voice/handle`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

