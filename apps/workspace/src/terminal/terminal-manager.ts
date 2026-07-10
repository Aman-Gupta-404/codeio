// terminal/terminal-manager.ts

import { PtySession } from "./pty-session";

export class TerminalManager {
  private session?: PtySession;

  getSession() {
    if (!this.session) {
      this.session = new PtySession();
    }

    return this.session;
  }

  dispose() {
    this.session?.dispose();
    this.session = undefined;
  }
}
