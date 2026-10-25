import { createFileRoute } from "@tanstack/react-router";
import { PayZenApp } from "@/components/payzen/PayZenApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PayZen — Animated Demo Payment App" },
      { name: "description", content: "PayZen is a premium animated fintech demo. Simulation only — no real money is ever transferred." },
      { property: "og:title", content: "PayZen — Animated Demo Payment App" },
      { property: "og:description", content: "Send, request and track fictional payments in a polished mobile demo. No real money moves." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PayZenApp,
});
