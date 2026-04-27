# Voice demo: Wise transfer tracking (Twilio)

Inbound calls hit Express; Twilio plays TwiML. Scope is **transfer tracking only** (where is my money, status, delays, sent but not received, etc.). Anything else gets a fixed deflection line and the call ends.

## Endpoints

| Method | Path | Role |
|--------|------|------|
| POST | `/voice/incoming` | Greeting + speech `<Gather>` |
| POST | `/voice/handle` | `SpeechResult` → classify → TwiML answer or deflect |
| GET | `/healthz` | `{ ok: true }` |

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

`npm test` builds and runs `src/agent/router.examples.ts` (routing smoke checks).

## Public URL (ngrok)

Twilio must reach your machine over HTTPS.

```bash
ngrok http 3000
```

Copy the **Forwarding** HTTPS URL (for example `https://xxxx.ngrok-free.dev`) and set:

```bash
BASE_URL=https://xxxx.ngrok-free.dev
```

Restart `npm run dev` after editing `.env`.

## Twilio

### Number to call (demo / grading)

**+1 (912) 933-7512** — E.164: `+19129337512`

Live audio only works while **this** app is running (`npm run dev`), **ngrok** is forwarding to that port, and this number’s **Voice** webhook **POST** URL matches your **current** ngrok base (e.g. `https://<your-ngrok-host>/voice/incoming`). Free ngrok hostnames change when you restart ngrok; update Twilio if it changes.

### Console setup

Phone number → Voice → **A call comes in** → Webhook → **HTTP POST** → URL:

`https://<your-host>/voice/incoming`

Where `<your-host>` is your current ngrok HTTPS host.

## curl

```bash
curl -s -X POST http://localhost:3000/voice/handle \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "SpeechResult=Where is my money?"
```

## Test plan (live call)

- Call **+1 (912) 933-7512**
- In-scope: “Where is my money?” → you should hear a short tracking answer + goodbye.
- Out-of-scope: “What are your fees?” → you should hear the deflection line + goodbye.

## Limits

Single turn, English, keyword router, no real agent handoff. Spoken answers come from `src/agent/faq.ts`.
