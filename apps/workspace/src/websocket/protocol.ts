// websocket/protocol.ts

export enum MessageType {
  // Files
  FILE_READ = "file:read",
  FILE_WRITE = "file:write",
  FILE_DELETE = "file:delete",
  FILE_LIST = "file:list",

  FILE_CONTENT = "file:content",
  FILE_CHANGED = "file:changed",

  // Terminal
  TERMINAL_ATTACH = "terminal:attach",
  TERMINAL_INPUT = "terminal:input",
  TERMINAL_OUTPUT = "terminal:output",

  // Process
  PROCESS_START = "process:start",
  PROCESS_STOP = "process:stop",

  PROCESS_OUTPUT = "process:output",
  PROCESS_EXIT = "process:exit",

  // Generic
  ERROR = "error",
}

export type ClientMessage =
  | {
      type: MessageType.FILE_READ;
      path: string;
    }
  | {
      type: MessageType.FILE_WRITE;
      path: string;
      content: string;
    }
  | {
      type: MessageType.FILE_DELETE;
      path: string;
    }
  | {
      type: MessageType.FILE_LIST;
      path?: string;
    }
  | {
      type: MessageType.TERMINAL_ATTACH;
    }
  | {
      type: MessageType.TERMINAL_INPUT;
      data: string;
    }
  | {
      type: MessageType.PROCESS_START;
      command: string;
      args?: string[];
    }
  | {
      type: MessageType.PROCESS_STOP;
    };

export type ServerMessage =
  | {
      type: MessageType.FILE_CONTENT;
      path: string;
      content: string;
    }
  | {
      type: MessageType.FILE_CHANGED;
      event: string;
      path: string;
    }
  | {
      type: MessageType.TERMINAL_OUTPUT;
      data: string;
    }
  | {
      type: MessageType.PROCESS_OUTPUT;
      output: string;
    }
  | {
      type: MessageType.PROCESS_EXIT;
      code: number | null;
    }
  | {
      type: MessageType.ERROR;
      message: string;
    };
