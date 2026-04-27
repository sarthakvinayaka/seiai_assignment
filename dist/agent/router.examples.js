"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("./router");
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
    ];
    let failures = 0;
    for (const c of cases) {
        const scope = (0, router_1.isInScope)(c.q);
        const intent = (0, router_1.detectIntent)(c.q);
        const routed = await (0, router_1.routeQuestion)({
            question: c.q,
            scopeConfidenceThreshold: 0.65
        });
        const ok = scope.inScope === c.expectIn;
        if (!ok)
            failures++;
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
