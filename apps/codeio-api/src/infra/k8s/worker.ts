import fs from "node:fs";
import path from "node:path";

import * as k8s from "@kubernetes/client-node";
import YAML from "yaml";

import { appsV1Api, coreV1Api, kc } from "./client";
import { KubernetesValues } from "./constants";

type WorkerEndpoints = {
  websocket: string;
  userApi: string;
};

const objectApi = k8s.KubernetesObjectApi.makeApiClient(kc);

// const NAMESPACE = KubernetesValues.namespace;

const NAMESPACE = process.env.K8S_NAMESPACE || "codeio";

const serviceType = process.env.WORKER_SERVICE_TYPE || "NodePort";

const imagePullPolicy = process.env.WORKER_IMAGE_PULL_POLICY || "Never";

const workerImage = process.env.WORKER_IMAGE || "workspace-service:latest";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ------------------- Create Resources -------------------
export async function createProjectResources(projectId: string): Promise<void> {
  const manifestPath = path.join(
    process.cwd(),
    "src",
    "infra",
    "k8s",
    "manifests",
    "worker.deployment.v1.yml",
  );

  let manifest = fs.readFileSync(manifestPath, "utf8");

  /*
  K8S_SERVICE_TYPE=NodePort
  K8S_SERVICE_TYPE=ClusterIP
  */
  //   manifest = manifest
  //     .replaceAll("{{PROJECT_ID}}", projectId)
  //     .replaceAll("{ SERVICE_TYPE }", process.env.K8S_SERVICE_TYPE || "ClusterIP")
  //     .replaceAll("NAMESPACE", NAMESPACE);

  manifest = manifest
    .replaceAll("{{PROJECT_ID}}", projectId)
    .replaceAll("NAMESPACE", NAMESPACE)
    // .replaceAll("{ SERVICE_TYPE }", serviceType)
    .replaceAll("IMAGE_PULL_POLICY", imagePullPolicy)
    .replaceAll("WORKER_IMAGE", workerImage);

  const resources = YAML.parseAllDocuments(manifest)
    .map((doc) => doc.toJSON())
    .filter(Boolean);

  for (const resource of resources) {
    try {
      await objectApi.create(resource);

      console.log(`Created ${resource.kind}/${resource.metadata.name}`);
    } catch (error: any) {
      console.error(
        `Failed to create ${resource.kind}/${resource.metadata.name}`,
      );

      // Ignore "Already Exists"
      if (error?.body?.reason !== "AlreadyExists") {
        throw error;
      }
    }
  }
}

// ------------------- Wait for Resources creation -------------------
export async function waitForPod(
  projectId: string,
  timeoutMs = 120000,
): Promise<k8s.V1Pod> {
  const startedAt = Date.now();

  while (true) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(
        `Timeout waiting for worker pod for project ${projectId}`,
      );
    }

    const response = await coreV1Api.listNamespacedPod({
      namespace: NAMESPACE,
      labelSelector: `app=worker-${projectId}`,
    });

    const pod = response.items[0];

    if (pod) {
      const isReady = pod.status?.conditions?.some(
        (condition) =>
          condition.type === "Ready" && condition.status === "True",
      );

      if (isReady) {
        console.log(`Pod ${pod.metadata?.name} is ready`);

        return pod;
      }

      console.log(`Waiting for pod ${pod.metadata?.name}...`);
    }

    await sleep(2000);
  }
}

async function waitForPodDeletion(
  projectId: string,
  timeoutMs = 60000,
): Promise<void> {
  const startedAt = Date.now();

  while (true) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(`Timeout waiting for worker pod deletion`);
    }

    const response = await coreV1Api.listNamespacedPod({
      namespace: NAMESPACE,
      labelSelector: `app=worker-${projectId}`,
    });

    if (response.items.length === 0) {
      console.log(`Worker pod for project ${projectId} deleted`);

      return;
    }

    await sleep(2000);
  }
}

export async function stopProjectResources(projectId: string): Promise<void> {
  const deploymentName = `worker-${projectId}`;
  const serviceName = `worker-svc-${projectId}`;

  try {
    await appsV1Api.deleteNamespacedDeployment({
      namespace: NAMESPACE,
      name: deploymentName,
    });

    console.log(`Deleted deployment ${deploymentName}`);
  } catch (error: any) {
    if (error?.body?.code !== 404) {
      throw error;
    }
  }

  try {
    await coreV1Api.deleteNamespacedService({
      namespace: NAMESPACE,
      name: serviceName,
    });

    console.log(`Deleted service ${serviceName}`);
  } catch (error: any) {
    if (error?.body?.code !== 404) {
      throw error;
    }
  }

  await waitForPodDeletion(projectId);
}

// DEV NOTE: If the backend is running inside k8s
// use this function to directly connect with the worker service via DNS
export function getWorkerServiceUrl(projectId: string): string {
  return `http://worker-svc-${projectId}.${NAMESPACE}.svc.cluster.local:3000`;
}

/**
If your backend is running outside the cluster and you're using KIND locally,
you'll most likely want a NodePort service instead, and then fetch the allocated node port:
 */
export async function getWorkerNodePort(projectId: string): Promise<number> {
  const service = await coreV1Api.readNamespacedService({
    namespace: NAMESPACE,
    name: `worker-svc-${projectId}`,
  });

  const port = service.spec?.ports?.[0]?.nodePort;

  if (!port) {
    throw new Error("NodePort not assigned");
  }

  return port;
}

// ------ OLD
// export async function getWorkerEndpoint(projectId: string): Promise<any> {
//   const namespace = process.env.K8S_NAMESPACE || "codeio";

//   if (process.env.NODE_ENV === "production") {
//     const userApi = `http://worker-svc-${projectId}.${namespace}.svc.cluster.local:3000`;

//     const wsServer = `http://worker-svc-${projectId}.${namespace}.svc.cluster.local:3001`;
//     // return `http://worker-svc-${projectId}.${namespace}.svc.cluster.local:3000`;
//     return {
//       userApi,
//       wsServer,
//     };
//   }

//   const svc = await coreV1Api.readNamespacedService({
//     namespace,
//     name: `worker-svc-${projectId}`,
//   });

//   const nodePort = svc.spec?.ports?.[0]?.nodePort;

//   return `http://localhost:${nodePort}`;
// }

export async function getWorkerEndpoints(
  projectId: string,
): Promise<WorkerEndpoints> {
  const namespace = process.env.K8S_NAMESPACE || "codeio";

  // Production -> use internal service DNS
  if (process.env.NODE_ENV === "production") {
    const serviceHost = `worker-svc-${projectId}.${namespace}.svc.cluster.local`;

    return {
      websocket: `http://${serviceHost}:3001`,
      userApi: `http://${serviceHost}:3000`,
    };
  }

  // Local (KIND + NodePort)
  const service = await coreV1Api.readNamespacedService({
    namespace,
    name: `worker-svc-${projectId}`,
  });

  const ports = service.spec?.ports ?? [];

  const wsPort = ports.find((p) => p.name === "ws")?.nodePort;

  const userPort = ports.find((p) => p.name === "user")?.nodePort;

  if (!wsPort || !userPort) {
    throw new Error(
      `NodePorts not found for worker service worker-svc-${projectId}`,
    );
  }

  return {
    websocket: `http://localhost:${wsPort}`,
    userApi: `http://localhost:${userPort}`,
  };
}
