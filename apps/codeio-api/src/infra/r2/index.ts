import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

import { r2Client } from "./client.js";

export async function getFileFromR2(key: string): Promise<string> {
  const response = await r2Client.send(
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
    }),
  );

  return await response.Body!.transformToString();
}

type WorkspaceFile = {
  path: string;
  content: string;
};

export async function fetchFolderFromR2(
  prefix: string,
): Promise<WorkspaceFile[]> {
  let continuationToken: string | undefined;

  const objectKeys: string[] = [];

  // 1. List all files under prefix
  do {
    const response = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET!,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );
    console.log({ response });

    objectKeys.push(
      ...((response.Contents ?? [])
        .map((obj) => obj.Key)
        .filter(Boolean) as string[]),
    );

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  // TODO: Ignore all the node_modules and such big files

  // 2. Download all files in parallel
  const files = await Promise.all(
    objectKeys.map(async (key) => {
      const response = await r2Client.send(
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET!,
          Key: key,
        }),
      );

      const content = await response.Body!.transformToString();

      return {
        path: key.replace(prefix, ""),
        content,
      };
    }),
  );

  return files;
}
