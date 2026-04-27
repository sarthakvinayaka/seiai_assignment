"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const twilio_1 = require("./routes/twilio");
const EnvSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    BASE_URL: zod_1.z.string().url().optional(),
    TWILIO_ACCOUNT_SID: zod_1.z.string().optional(),
    TWILIO_AUTH_TOKEN: zod_1.z.string().optional(),
    TWILIO_PHONE_NUMBER: zod_1.z.string().optional(),
    SCOPE_CONFIDENCE_THRESHOLD: zod_1.z.coerce.number().min(0).max(1).default(0.65),
});
function loadEnv() {
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
    const app = (0, express_1.default)();
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use(express_1.default.json());
    app.get("/healthz", (_req, res) => res.json({ ok: true }));
    app.use("/voice", (0, twilio_1.createTwilioRouter)(env));
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
