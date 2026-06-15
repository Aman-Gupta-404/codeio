import * as k8s from "@kubernetes/client-node";

const kc = new k8s.KubeConfig();

/**
 * Local:
 *   ~/.kube/config
 *
 * Cluster:
 *   ServiceAccount automatically mounted (since this will be inside a pod)
 */

if (process.env.NODE_ENV === "production") {
  kc.loadFromCluster();
} else {
  kc.loadFromDefault();
  //TODO: shift this context to env
  // NOTE: This context is basically which k8s cluster your node js app will use
  kc.setCurrentContext("kind-codeio");
}

console.log(Object.keys(k8s));

export const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);

export const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);

export { kc };
