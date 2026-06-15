import * as k8s from "@kubernetes/client-node";

import { coreV1Api } from "./client";
import { KubernetesValues } from "./constants";
import { WORKSPACE_IMAGES } from "./images";

export async function createWorkspacePod(
  userId: string,
  projectId: string,
  language: "python" | "node",
): Promise<{ podName: string }> {
  try {
    const podName = `workspace-${projectId}`;

    const image = WORKSPACE_IMAGES[language];

    console.log({ podName, image });

    const res = coreV1Api.createNamespacedPod({
      namespace: KubernetesValues.namespace,
      body: {
        apiVersion: "v1",
        kind: "Pod",
        metadata: {
          name: podName,
          labels: {
            projectId,
            userId,
          },
        },
        spec: {
          containers: [
            {
              name: "workspace",
              image: image,
              tty: true,
              stdin: true,
            },
          ],
        },
      },
    });
    console.log({ res });

    return {
      podName,
    };
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
}
export async function testFunc() {
  console.log("code: ", coreV1Api);
}

export async function deleteWorkspacePod(projectId: string) {
  const podName = `workspace-${projectId}`;

  return coreV1Api.deleteNamespacedPod({
    name: podName,
    namespace: KubernetesValues.namespace,
  });
}

export async function waitForPodRunning(podName: string, timeoutMs = 30000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const pod = await coreV1Api.readNamespacedPod({
      name: podName,
      namespace: KubernetesValues.namespace,
    });

    const phase = pod.status?.phase;

    if (phase === "Running") {
      return true;
    }

    if (phase === "Failed") {
      console.log("Failed");
      throw new Error(`Pod ${podName} failed`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timeout waiting for pod ${podName}`);
}
