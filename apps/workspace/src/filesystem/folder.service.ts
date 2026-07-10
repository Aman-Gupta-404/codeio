// filesystem/folder.service.ts

import fs from "fs/promises";
import { resolveWorkspacePath } from "../utils/path";

export async function createFolder(folderPath: string) {
  await fs.mkdir(resolveWorkspacePath(folderPath), {
    recursive: true,
  });
}

export async function deleteFolder(folderPath: string) {
  await fs.rm(resolveWorkspacePath(folderPath), {
    recursive: true,
    force: true,
  });
}
