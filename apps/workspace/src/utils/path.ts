import path from "path";
import { WORKSPACE_ROOT } from "../data/constants";

export function resolveWorkspacePath(userPath: string) {
  const resolved = path.resolve(WORKSPACE_ROOT, userPath);
  console.log({ WORKSPACE_ROOT, resolved });
  if (!resolved.startsWith(WORKSPACE_ROOT)) {
    throw new Error("Invalid path");
  }

  return resolved;
}
