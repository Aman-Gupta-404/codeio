"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useProject } from "../../context/project-context";

import "xterm/css/xterm.css";
import { useTheme } from "next-themes";

export default function TerminalComponent() {
  const { resolvedTheme } = useTheme();
  const terminalRef = useRef<HTMLDivElement>(null);

  const terminalInstance = useRef<Terminal | null>(null);

  const { resizeTerminal, subscribeTerminal, writeTerminal } = useProject();

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      convertEol: true,
      // theme: {
      //   background: "#0f172a",
      // },
      theme:
        resolvedTheme === "dark"
          ? {
              background: "#09090b",
              foreground: "#fafafa",
              cursor: "#fafafa",
              selectionBackground: "#3f3f46",
              black: "#18181b",
              red: "#ef4444",
              green: "#22c55e",
              yellow: "#eab308",
              blue: "#3b82f6",
              magenta: "#a855f7",
              cyan: "#06b6d4",
              white: "#f4f4f5",
              brightBlack: "#52525b",
              brightRed: "#f87171",
              brightGreen: "#4ade80",
              brightYellow: "#facc15",
              brightBlue: "#60a5fa",
              brightMagenta: "#c084fc",
              brightCyan: "#22d3ee",
              brightWhite: "#ffffff",
            }
          : {
              background: "#ffffff",
              foreground: "#18181b",
              cursor: "#18181b",
              selectionBackground: "#d4d4d8",
              black: "#000000",
              red: "#dc2626",
              green: "#16a34a",
              yellow: "#ca8a04",
              blue: "#2563eb",
              magenta: "#9333ea",
              cyan: "#0891b2",
              white: "#e4e4e7",
              brightBlack: "#71717a",
              brightRed: "#ef4444",
              brightGreen: "#22c55e",
              brightYellow: "#eab308",
              brightBlue: "#3b82f6",
              brightMagenta: "#a855f7",
              brightCyan: "#06b6d4",
              brightWhite: "#ffffff",
            },
    });

    terminalInstance.current = term;

    const fitAddon = new FitAddon();

    term.loadAddon(fitAddon);

    term.open(terminalRef.current!);

    requestAnimationFrame(() => {
      fitAddon.fit();
      resizeTerminal(term.cols, term.rows);
    });

    // Observe parent/container resize
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      resizeTerminal(term.cols, term.rows);
    });
    const parent = terminalRef.current!.parentElement!;

    resizeObserver.observe(parent);

    term.onData((data) => {
      console.log({ data });
      if (!data) return;
      writeTerminal(data);
    });

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeTerminal((data) => {
      terminalInstance.current?.write(data);
    });

    return unsubscribe;
  }, [subscribeTerminal]);

  return (
    <div
      ref={terminalRef}
      className="w-full h-full overflow-hidden min-h-0 min-w-0 border-2"
    />
  );
}
