"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiProvider = void 0;
const zod_1 = require("zod");
const OpenAiResponseSchema = zod_1.z.object({
    label: zod_1.z.enum(["IN_SCOPE", "OUT_OF_SCOPE"]),
    confidence: zod_1.z.number().min(0).max(1),
    reason: zod_1.z.string()
});
class OpenAiProvider {
    apiKey;
    model;
    constructor(opts) {
        this.apiKey = opts.apiKey;
        this.model = opts.model ?? "gpt-4o-mini";
    }
    async classifyScope(question) {
        const prompt = [
            "Output a single JSON object, no markdown, keys: label, confidence, reason.",
            'label is "IN_SCOPE" or "OUT_OF_SCOPE". confidence is a number from 0 to 1.',
            "IN_SCOPE: Wise outbound transfer tracking only (status, delay, arrival estimate, sent but not received, proof of payment, banking partner reference).",
            "OUT_OF_SCOPE: fees, cancel, payment methods, cards, login, identity verification, or unrelated.",
            `Utterance: ${JSON.stringify(question)}`
        ].join("\n");
        const res = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                input: prompt,
                temperature: 0,
                max_output_tokens: 120
            })
        });
        if (!res.ok) {
            return {
                label: "OUT_OF_SCOPE",
                confidence: 0,
                reason: `OpenAI error: ${res.status}`
            };
        }
        const json = (await res.json());
        const text = json?.output?.[0]?.content?.find((c) => c?.type === "output_text")?.text ??
            json?.output_text ??
            "";
        try {
            const parsed = OpenAiResponseSchema.parse(JSON.parse(text));
            return parsed;
        }
        catch {
            return {
                label: "OUT_OF_SCOPE",
                confidence: 0,
                reason: "OpenAI returned unparsable output"
            };
        }
    }
}
exports.OpenAiProvider = OpenAiProvider;
