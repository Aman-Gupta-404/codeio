import fs from "node:fs";
import path from "node:path";

import * as k8s from "@kubernetes/client-node";
import YAML from "yaml";

import { appsV1Api, coreV1Api, kc } from "./client";
import { KubernetesValues } from "./constants";
import { AppError } from "../../errors/app-error";

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

const syncWorkerImage =
  process.env.WORKSPACE_SYNC_IMAGE || "codeio-workspace-sync:latest";

const storageClass = process.env.STORAGE_CLASS || "standard";

const r2Bucket = process.env.R2_BUCKET || "codeio";

const r2Endpoint = process.env.R2_ENDPOINT || null;

const r2AccessKey = process.env.R2_ACCESS_KEY || null;

const r2SecretKey = process.env.R2_SECRET_KEY || null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ------------------- Create Resources -------------------
export async function createProjectResources(projectId: string): Promise<void> {
  if (!r2Endpoint || !r2AccessKey || !r2SecretKey)
    throw AppError.internal("R2 details not found");

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
    .replaceAll("IMAGE_PULL_POLICY", imagePullPolicy)
    .replaceAll("WORKER_IMAGE", workerImage)
    .replaceAll("{{R2_BUCKET}}", r2Bucket)
    .replaceAll("{{R2_ENDPOINT}}", r2Endpoint)
    .replaceAll("WORKING_SIZE", "5Gi")
    .replaceAll("STORAGE_CLASS", storageClass)
    .replaceAll("WORKSPACE_SYNC_IMAGE", syncWorkerImage)
    .replaceAll("{{SYNC_INTERVAL}}", "60")
    .replaceAll("{{R2_ACCESS_KEY}}", r2AccessKey)
    .replaceAll("{{R2_SECRET_KEY}}", r2SecretKey);

  // await fs.writeFileSync("./worker-manifests/prod.tempManifest.yaml", manifest);
  // ?NOTE: storage class: Kind -> standard | vltur -> vultr-block-storage
  // ? DigitalOcean -> do-block-storage

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

      if (error?.body && typeof JSON.parse(error?.body) === "object") {
        const errorBody = JSON.parse(error?.body);
        if (errorBody.reason == "AlreadyExists") {
          // Ignore "Already Exists"
          console.log("=== resource already exist ===");
        } else {
          throw new Error(error);
        }
      } else {
        throw new Error(error);
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

// new function to check the status
export async function getPodRunningStatus(projectId: string) {
  const response = await coreV1Api.listNamespacedPod({
    namespace: NAMESPACE,
    labelSelector: `app=worker-${projectId}`,
  });

  const pod = response.items[0];

  if (pod) {
    const isReady = pod.status?.conditions?.some(
      (condition) => condition.type === "Ready" && condition.status === "True",
    );

    if (isReady) {
      console.log(`Pod ${pod.metadata?.name} is ready`);

      return { started: true };
    }

    console.log(`Waiting for pod ${pod.metadata?.name}...`);
  }

  return { started: false };
}

async function deleteResource(resource: {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
  };
}) {
  try {
    await objectApi.delete(resource);
    console.log(`Deleted ${resource.kind}/${resource.metadata.name}`);
  } catch (error: any) {
    console.error(
      `Failed to delete ${resource.kind}/${resource.metadata.name}`,
    );

    if (error?.body && typeof JSON.parse(error?.body) === "object") {
      const errorBody = JSON.parse(error?.body);
      if (errorBody.reason == "NotFound") {
        // Ignore "Already Exists"
        console.log("=== resource already delete ===");
        return;
      } else {
        throw new Error(error);
      }
    }

    throw error;
  }
}

export async function deleteProjectResources(projectId: string): Promise<void> {
  try {
    console.log("========== Initialize delete resource");
    // 1. Delete Deployment
    await deleteResource({
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: {
        name: `worker-${projectId}`,
        namespace: NAMESPACE,
      },
    });

    console.log("========== Wait for pod deletion");
    // 2. Wait for all pods to terminate so the PVC is no longer in use
    await waitForPodDeletion(projectId);

    console.log("========== initializing svc deletion");
    // 3. Delete Service
    await deleteResource({
      apiVersion: "v1",
      kind: "Service",
      metadata: {
        name: `worker-svc-${projectId}`,
        namespace: NAMESPACE,
      },
    });

    console.log("========== initializing pvc deletion");
    // 4. Delete PVC
    // TODO: Issue --> sync r2 storage with pvc before deletion
    await deleteResource({
      apiVersion: "v1",
      kind: "PersistentVolumeClaim",
      metadata: {
        name: `workspace-pvc-${projectId}`,
        namespace: NAMESPACE,
      },
    });

    console.log(`Successfully cleaned up project ${projectId}`);
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function waitForPodDeletion(
  projectId: string,
  timeoutMs = 120000,
): Promise<void> {
  const startedAt = Date.now();

  while (true) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(
        `Timeout waiting for pod deletion for project ${projectId}`,
      );
    }

    const response = await coreV1Api.listNamespacedPod({
      namespace: NAMESPACE,
      labelSelector: `app=worker-${projectId}`,
    });

    if (response.items.length === 0) {
      console.log(`Worker pod deleted`);
      return;
    }

    await sleep(2000);
  }
}

export async function getPodDeleteStatus(projectId: string) {
  const response = await coreV1Api.listNamespacedPod({
    namespace: NAMESPACE,
    labelSelector: `app=worker-${projectId}`,
  });

  if (response.items.length === 0) {
    console.log(`Worker pod deleted`);
    return { deleted: true };
  }

  return { deleted: false };
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
