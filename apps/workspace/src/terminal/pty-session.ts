// terminal/pty-session.ts
import os from "os";
import * as pty from "node-pty";
import type { IPty } from "node-pty";

export class PtySession {
  private ptyProcess: IPty;

  constructor() {
    const shell =
      os.platform() === "win32"
        ? "powershell.exe"
        : process.env.SHELL || "bash";

    this.ptyProcess = pty.spawn(shell, [], {
      name: "xterm-256color",
      cwd: "/workspace",
      // cwd: "/",
      cols: 80,
      rows: 30,
      env: process.env,
    });
  }

  write(data: string) {
    this.ptyProcess.write(data);
  }

  resize(cols: number, rows: number) {
    this.ptyProcess.resize(cols, rows);
  }

  onData(cb: (data: string) => void) {
    // this.ptyProcess.onData(cb);
    this.ptyProcess.onData((data) => {
      cb(data);
    });
  }

  onExit(cb: () => void) {
    this.ptyProcess.onExit(cb);
  }

  dispose() {
    this.ptyProcess.kill();
  }
}
