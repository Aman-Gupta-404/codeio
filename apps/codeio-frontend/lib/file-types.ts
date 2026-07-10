// lib/file-types.ts

import {
  FileCode2,
  FileJson,
  FileText,
  FileCog,
  FileType2,
} from "lucide-react";

export type FileMeta = {
  icon: string;
  color: string;
};

export const FILE_TYPES: Record<string, FileMeta> = {
  // React / JS ecosystem
  ts: {
    icon: "vscode-icons:file-type-typescript",
    color: "var(--editor-ts)",
  },
  tsx: {
    icon: "vscode-icons:file-type-reactts",
    color: "var(--editor-react)",
  },
  js: {
    icon: "vscode-icons:file-type-js-official",
    color: "var(--editor-js)",
  },
  jsx: {
    icon: "vscode-icons:file-type-reactjs",
    color: "var(--editor-react)",
  },

  // Styling
  css: {
    icon: "vscode-icons:file-type-css",
    color: "var(--editor-css)",
  },
  scss: {
    icon: "vscode-icons:file-type-scss",
    color: "var(--editor-scss)",
  },
  sass: {
    icon: "vscode-icons:file-type-sass",
    color: "var(--editor-scss)",
  },
  less: {
    icon: "vscode-icons:file-type-less",
    color: "var(--editor-less)",
  },

  // Markup
  html: {
    icon: "vscode-icons:file-type-html",
    color: "var(--editor-html)",
  },
  md: {
    icon: "vscode-icons:file-type-markdown",
    color: "var(--editor-md)",
  },

  // Config / Data
  json: {
    icon: "vscode-icons:file-type-json",
    color: "var(--editor-json)",
  },
  yaml: {
    icon: "vscode-icons:file-type-yaml",
    color: "var(--editor-yaml)",
  },
  yml: {
    icon: "vscode-icons:file-type-yaml",
    color: "var(--editor-yaml)",
  },
  xml: {
    icon: "vscode-icons:file-type-xml",
    color: "var(--editor-xml)",
  },

  // Env / Config
  env: {
    icon: "vscode-icons:file-type-dotenv",
    color: "var(--editor-env)",
  },

  // Frameworks
  vue: {
    icon: "vscode-icons:file-type-vue",
    color: "var(--editor-vue)",
  },
  svelte: {
    icon: "vscode-icons:file-type-svelte",
    color: "var(--editor-svelte)",
  },

  // Backend
  py: {
    icon: "vscode-icons:file-type-python",
    color: "var(--editor-python)",
  },
  java: {
    icon: "vscode-icons:file-type-java",
    color: "var(--editor-java)",
  },
  go: {
    icon: "vscode-icons:file-type-go",
    color: "var(--editor-go)",
  },
  rs: {
    icon: "vscode-icons:file-type-rust",
    color: "var(--editor-rust)",
  },
  php: {
    icon: "vscode-icons:file-type-php",
    color: "var(--editor-php)",
  },

  // Shell
  sh: {
    icon: "vscode-icons:file-type-shell",
    color: "var(--editor-shell)",
  },
  bash: {
    icon: "vscode-icons:file-type-shell",
    color: "var(--editor-shell)",
  },

  // Misc
  txt: {
    icon: "vscode-icons:file-type-text",
    color: "var(--muted-foreground)",
  },

  default: {
    icon: "vscode-icons:default-file",
    color: "var(--muted-foreground)",
  },
};
