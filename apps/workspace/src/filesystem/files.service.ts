// filesystem/file.service.ts

import fs from "fs/promises";
import { resolveWorkspacePath } from "../utils/path";

export async function readFile(filePath: string) {
  return fs.readFile(resolveWorkspacePath(filePath), "utf8");
}

export async function createFile(filePath: string) {
  return fs.writeFile(resolveWorkspacePath(filePath), "");
}

export async function writeFile(filePath: string, content: string) {
  return fs.writeFile(resolveWorkspacePath(filePath), content);
}

export async function deleteFile(filePath: string) {
  return fs.unlink(resolveWorkspacePath(filePath));
}
