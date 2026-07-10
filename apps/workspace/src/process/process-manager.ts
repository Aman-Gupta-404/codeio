// process/process-manager.ts

import { ChildProcess, spawn } from "child_process";

export class ProcessManager {
  private process?: ChildProcess;

  start(
    command: string,
    args: string[],
    onOutput: (data: string) => void,
    onExit: (code: number | null) => void,
  ) {
    if (this.process) {
      throw new Error("Process already running");
    }

    this.process = spawn(command, args, {
      cwd: "/workspace",
    });

    this.process.stdout?.on("data", (d) => onOutput(d.toString()));

    this.process.stderr?.on("data", (d) => onOutput(d.toString()));

    this.process.on("exit", (code) => {
      this.process = undefined;
      onExit(code);
    });
  }

  stop() {
    this.process?.kill("SIGTERM");
    this.process = undefined;
  }
}
