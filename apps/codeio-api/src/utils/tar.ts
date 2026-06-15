import tar from "tar-stream";
import { PassThrough } from "stream";

type WorkspaceFile = {
  path: string;
  content: string;
};

export async function createTarStream(files: WorkspaceFile[]) {
  const pack = tar.pack();

  for (const file of files) {
    pack.entry(
      {
        name: file.path,
      },
      file.content,
    );
  }

  pack.finalize();

  return pack;
}
