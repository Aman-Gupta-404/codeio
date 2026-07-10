export enum Events {
  READ_FILE = "read-file",
  WRITE_FILE = "write-file",
  DELETE_FILE = "delete-file",
  CREATE_FILE = "create-file",

  CREATE_FOLDER = "create-folder",
  DELETE_FOLDER = "delete-folder",

  GET_TREE = "get-tree",

  TERMINAL_CREATE = "terminal-create",
  TERMINAL_INPUT = "terminal-input",
  TERMINAL_RESIZE = "terminal-resize",
  TERMINAL_OUTPUT = "terminal-output",
  TERMINAL_EXIT = "terminal-exit",

  SUCCESS = "success",
  ERROR = "error",
}
