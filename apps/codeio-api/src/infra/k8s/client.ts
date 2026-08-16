import * as k8s from "@kubernetes/client-node";

const kc = new k8s.KubeConfig();

/**
 * Local:
 *   ~/.kube/config
 *
 * Cluster:
 *   ServiceAccount automatically mounted (since this will be inside a pod)
 */

if (process.env.K8S_CONFIG === "in-cluster") {
  // ====== in-cluster Kubernete ========
  // when using the app inside k8s it will pick up the context on its own
  kc.loadFromCluster();
} else {
  // ====== local cluster ========
  kc.loadFromDefault();

  // NOTE: This context is basically which k8s cluster your node js app will use
  kc.setCurrentContext(process.env.K8S_CONTEXT || "kind-codeio");
}

export const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);

export const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);

export { kc };
