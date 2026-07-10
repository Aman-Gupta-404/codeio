"use client";

import dynamic from "next/dynamic";
import type { BeforeMount, OnMount } from "@monaco-editor/react";

import { useTheme } from "next-themes";
import { JetBrains_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import { getMonacoLanguage } from "../../../utils/helper";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Loading editor...
    </div>
  ),
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
});

interface Props {
  code: string;
  fileName: string;
  setCode: (value: string) => void;
  onCursorChange: (line: number, column: number) => void;
}

export default function EditorBody({
  code,
  setCode,
  onCursorChange,
  fileName,
}: Props) {
  const [colors, setColors] = useState({
    background: "#ffffff",
    foreground: "#000000",
  });

  const { resolvedTheme } = useTheme();

  const handleMount: OnMount = (editor) => {
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange(e.position.lineNumber, e.position.column);
    });
  };

  //   const handleBeforeMount: BeforeMount = (monaco) => {
  //     console.log("beforeMount");
  //     // if (typeof window === "undefined") return;

  //     const root = getComputedStyle(document.documentElement);
  //     const background = root.getPropertyValue("--background").trim();
  //     const foreground = root.getPropertyValue("--foreground").trim();
  //     console.log({ background, foreground });
  //     monaco.editor.defineTheme("shadcn-light", {
  //       base: "vs",
  //       inherit: true,
  //       rules: [],
  //       colors: {
  //         "editor.background": background,
  //         "editor.foreground": foreground,

  //         "editorGutter.background": background,

  //         "editorLineNumber.foreground": "rgba(128,128,128,.45)",

  //         "editorCursor.foreground": foreground,

  //         "editor.lineHighlightBackground": "transparent",

  //         "editor.selectionBackground": "rgba(120,120,120,.25)",

  //         "editor.inactiveSelectionBackground": "rgba(120,120,120,.15)",
  //       },
  //     });

  //     monaco.editor.defineTheme("shadcn-dark", {
  //       base: "vs-dark",
  //       inherit: true,
  //       rules: [],
  //       colors: {
  //         // colors
  //         "editor.background": background,
  //         "editor.foreground": foreground,

  //         "editorGutter.background": background,

  //         "editorLineNumber.foreground": "rgba(128,128,128,.45)",

  //         "editorCursor.foreground": foreground,

  //         "editor.lineHighlightBackground": "transparent",

  //         "editor.selectionBackground": "rgba(120,120,120,.25)",

  //         "editor.inactiveSelectionBackground": "rgba(120,120,120,.15)",
  //       },
  //     });
  //   };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const styles = getComputedStyle(document.documentElement);

      setColors({
        background: styles.backgroundColor,
        foreground: styles.color,
      });
    } catch (error) {
      console.log({ error });
    }
  }, [resolvedTheme]);

  const handleBeforeMount: BeforeMount = (monaco) => {
    console.log({ colors });

    monaco.editor.defineTheme("shadcn-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        // "editor.background": "#ffffff",
        // "editor.background": colors.background,
        // "editor.foreground": colors.foreground,
        // "editorGutter.background": colors.background,
        // "editorLineNumber.foreground": "rgba(128,128,128,.45)",
        // "editorCursor.foreground": colors.foreground,
        // "editor.lineHighlightBackground": "transparent",
        // "editor.selectionBackground": "rgba(120,120,120,.25)",
        // "editor.inactiveSelectionBackground": "rgba(120,120,120,.15)",
      },
    });

    monaco.editor.defineTheme("shadcn-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        // "editor.background": "#09090b",
        // "editor.background": colors.background,
        // "editor.foreground": colors.foreground,
        // "editorGutter.background": colors.background,
        // "editorLineNumber.foreground": "rgba(128,128,128,.45)",
        // "editorCursor.foreground": colors.foreground,
        // "editor.lineHighlightBackground": "transparent",
        // "editor.selectionBackground": "rgba(120,120,120,.25)",
        // "editor.inactiveSelectionBackground": "rgba(120,120,120,.15)",
      },
    });
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="typescript"
      language={getMonacoLanguage(fileName)}
      value={code}
      onMount={handleMount}
      beforeMount={handleBeforeMount}
      onChange={(value) => setCode(value ?? "")}
      theme={resolvedTheme === "dark" ? "shadcn-dark" : "shadcn-light"}
      options={{
        minimap: {
          enabled: false,
        },
        overviewRulerBorder: false,

        fontSize: 14,
        // fontFamily: "JetBrains Mono",
        fontFamily: jetbrains.style.fontFamily,
        wordWrap: "on",

        scrollBeyondLastLine: false,

        automaticLayout: true,

        tabSize: 2,

        renderWhitespace: "selection",

        cursorBlinking: "blink",

        smoothScrolling: true,

        padding: {
          top: 16,
          bottom: 16,
        },

        scrollbar: {
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
        },
      }}
    />
  );
}
