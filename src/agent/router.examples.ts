import { detectIntent, isInScope, routeQuestion } from "./router";

async function run() {
  const cases = [
    { q: "Where is my money?", expectIn: true },
    { q: "How do I track my transfer?", expectIn: true },
    { q: "Why is my transfer delayed?", expectIn: true },
    { q: "It says transfer sent but my recipient has not received it.", expectIn: true },
    { q: "What does money received mean?", expectIn: true },
    { q: "How do I cancel my transfer?", expectIn: false },
    { q: "What are your fees?", expectIn: false },
    { q: "Can I send money by card?", expectIn: false },
    { q: "I need help logging in.", expectIn: false }
  ] as const;

  let failures = 0;
  for (const c of cases) {
    const scope = isInScope(c.q);
    const intent = detectIntent(c.q);
    const routed = await routeQuestion({
      question: c.q,
      scopeConfidenceThreshold: 0.65
    });

    const ok = scope.inScope === c.expectIn;
    if (!ok) failures++;

    console.log(JSON.stringify({ q: c.q, scope, intent, routedKind: routed.kind }, null, 2));
  }

  if (failures > 0) {
    console.error(`\nFAILED ${failures} routing example(s).`);
    process.exit(1);
  }

  console.log("\nOK routing examples.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

