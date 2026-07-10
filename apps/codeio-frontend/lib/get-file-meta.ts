// lib/get-file-meta.ts

import { FILE_TYPES } from "./file-types";

export function getFileMeta(ext?: string) {
  if (!ext) return FILE_TYPES.default;

  return FILE_TYPES[ext] ?? FILE_TYPES.default;
}
