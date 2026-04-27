import type { Request, Response } from "express";
import { Router } from "express";
import twilio from "twilio";
import { routeQuestion } from "../agent/router";
import type { Env } from "../server";

function buildVoiceResponse() {
  return new twilio.twiml.VoiceResponse();
}

function sayAndHangup(vr: twilio.twiml.VoiceResponse, message: string, closing: string) {
  vr.say({ voice: "alice" }, message);
  vr.say({ voice: "alice" }, closing);
  vr.hangup();
}

export function createTwilioRouter(env: Env) {
  const r = Router();

  r.post("/incoming", async (_req: Request, res: Response) => {
    const vr = buildVoiceResponse();

    vr.say(
      { voice: "alice" },
      "Hello, you’ve reached transfer support. I can help with where-is-my-money questions for Wise transfers."
    );

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

  r.post("/handle", async (req: Request, res: Response) => {
    const vr = buildVoiceResponse();

    const speechResult = String(req.body?.SpeechResult ?? "").trim();
    console.log("[twilio] SpeechResult:", speechResult);

    const scopeConfidenceThreshold = env.SCOPE_CONFIDENCE_THRESHOLD;

    const routed = await routeQuestion({
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

