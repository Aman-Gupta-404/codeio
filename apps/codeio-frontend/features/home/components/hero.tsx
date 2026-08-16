"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-bold">{number}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function CodePreview() {
  const lines = [
    "# fibonacci with memoization",
    "",
    "def fib(n, memo={}):",
    "  if n <= 1: return n",
    "  if n not in memo:",
    "    memo[n] = fib(n-1) + fib(n-2)",
    "  return memo[n]",
    "",
    "for i in range(10):",
    "  print(fib(i))",
  ];

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />

        <span className="ml-2 text-sm text-muted-foreground">main.py</span>
      </div>

      {/* Code */}
      <div className="bg-muted/20 p-5 font-mono text-sm">
        {lines.map((line, index) => (
          <div key={index} className="flex gap-4">
            <span className="w-6 select-none text-right text-muted-foreground">
              {index + 1}
            </span>

            <span className="whitespace-pre text-foreground">{line}</span>
          </div>
        ))}
      </div>

      {/* Output */}
      <div className="flex items-center justify-between border-t px-5 py-3">
        <span className="font-mono text-xs text-emerald-500">
          ▶ Output: 0 1 1 2 3 5 8 13 21 34
        </span>

        <span className="text-xs text-muted-foreground">182ms</span>
      </div>
    </div>
  );
}

function Hero() {
  const router = useRouter();
  return (
    <section className="relative flex min-h-[calc(100vh-56px)] items-center justify-center overflow-hidden px-6 py-16">
      {/* Grid Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(128,128,128,.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(128,128,128,.15) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      <div className="relative z-10 grid w-full max-w-7xl items-center gap-16 lg:grid-cols-2">
        {/* Left Content */}
        <div>
          <Badge
            variant="secondary"
            className="mb-5 gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-indigo-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {/* Now with AI-powered autocomplete */}
            Browser based code editor
          </Badge>

          <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Code. Run. Ship.
            <br />
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              From anywhere.
            </span>
          </h1>

          <p className="mb-9 max-w-xl text-lg leading-8 text-muted-foreground">
            A cloud IDE that runs your code instantly — no setup, no config.
            Just write and execute.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => {
                router.push("/projects");
              }}
            >
              Start coding free
            </Button>

            {/* <Button size="lg" variant="outline">
              View demo →
            </Button> */}
          </div>

          {/* <div className="mt-10 flex gap-8">
            <Stat number="2M+" label="Developers" />
            <Stat number="30+" label="Languages" />
            <Stat number="<200ms" label="Cold start" />
          </div> */}
        </div>

        {/* Right Code Window */}
        <CodePreview />
      </div>
    </section>
  );
}

export default Hero;
