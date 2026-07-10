import fs from "fs/promises";
import path from "path";
import { resolveWorkspacePath } from "../utils/path";

const ignored = new Set([".git", "node_modules", ".DS_Store"]);

export async function buildTree(dir: string): Promise<any> {
  const workspacePath = resolveWorkspacePath(dir);

  const entries = await fs.readdir(workspacePath, {
    withFileTypes: true,
  });

  return Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return {
          name: entry.name,
          type: "folder",
          parentPath: dir,
          path: fullPath,
          children: await buildTree(fullPath),
        };
      }

      return {
        name: entry.name,
        type: "file",
        parentPath: dir,
        path: fullPath,
        ext: entry.name.split(".").pop() || "txt",
      };
    }),
  );
}
