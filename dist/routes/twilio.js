"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTwilioRouter = createTwilioRouter;
const express_1 = require("express");
const twilio_1 = __importDefault(require("twilio"));
const router_1 = require("../agent/router");
function buildVoiceResponse() {
    return new twilio_1.default.twiml.VoiceResponse();
}
function sayAndHangup(vr, message, closing) {
    vr.say({ voice: "alice" }, message);
    vr.say({ voice: "alice" }, closing);
    vr.hangup();
}
function createTwilioRouter(env) {
    const r = (0, express_1.Router)();
    r.post("/incoming", async (_req, res) => {
        const vr = buildVoiceResponse();
        vr.say({ voice: "alice" }, "Hello, you’ve reached transfer support. I can help with where-is-my-money questions for Wise transfers.");
        const gather = vr.gather({
            input: ["speech"],
            action: "/voice/handle",
            method: "POST",
            speechTimeout: "auto"
        });
        gather.say({ voice: "alice" }, "How can I help?");
        vr.say({ voice: "alice" }, "I didn’t catch that.");
        vr.say({ voice: "alice" }, "That’s all I can help with on this line today. Goodbye.");
        vr.hangup();
        res.type("text/xml").send(vr.toString());
    });
    r.post("/handle", async (req, res) => {
        const vr = buildVoiceResponse();
        const speechResult = String(req.body?.SpeechResult ?? "").trim();
        console.log("[twilio] SpeechResult:", speechResult);
        const scopeConfidenceThreshold = env.SCOPE_CONFIDENCE_THRESHOLD;
        const routed = await (0, router_1.routeQuestion)({
            question: speechResult,
            scopeConfidenceThreshold
        });
        console.log("[router]", JSON.stringify(routed.debug, null, 2));
        if (routed.kind === "IN_SCOPE") {
            vr.say({ voice: "alice" }, routed.answer);
            vr.say({ voice: "alice" }, routed.closingMessage);
            vr.hangup();
            return res.type("text/xml").send(vr.toString());
        }
        sayAndHangup(vr, routed.deflectionMessage, routed.closingMessage);
        return res.type("text/xml").send(vr.toString());
    });
    return r;
}
