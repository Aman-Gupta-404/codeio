# CodeIO

CodeIO is a remote code execution platform designed around Kubernetes.

> A Kubernetes-based remote code execution platform that provisions isolated coding environments on demand and provides real-time interaction with each environment through WebSockets.

When a user creates a project, CodeIO dynamically provisions a dedicated Kubernetes workspace consisting of a worker Deployment, Service, and PersistentVolumeClaim. The user can then interact with that workspace through a WebSocket connection routed through a dedicated gateway service.

The platform runs locally using KIND and is deployed to a managed Kubernetes cluster using Civo.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Request Flow](#request-flow)
- [Workspace Lifecycle](#workspace-lifecycle)
- [WebSocket Architecture](#websocket-architecture)
- [Workspace Persistence](#workspace-persistence)
- [Kubernetes Architecture](#kubernetes-architecture)
- [Security](#security)
- [Networking](#networking)
- [Resource Management](#resource-management)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
<!-- - [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Production Deployment](#production-deployment)
- [CI/CD](#cicd) -->
- [Engineering Decisions](#engineering-decisions)
- [Challenges](#challenges)
- [Scalability](#scalability)
- [Monitoring](#monitoring)
<!-- - [Future Improvements](#future-improvements) -->
- [Screenshots](#screenshots)
- [Demo](#demo)
- [Author](#author)

---

# Overview

CodeIO provides users with isolated coding environments that can be created and destroyed dynamically.

The platform consists of three permanent application services:

1. **Frontend** - Next.js application responsible for the user interface.
2. **API** - Node.js/Express backend responsible for authentication, project management, and Kubernetes resource orchestration.
3. **Workspace Gateway** - WebSocket gateway responsible for authenticating and routing connections to the correct project workspace.

Worker environments are created dynamically for individual projects.

A simplified architecture looks like this:

```text
                         ┌─────────────────┐
                         │      User       │
                         └────────┬────────┘
                                  │
                         HTTPS / WSS
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │    NGINX Ingress       │
                     └───────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
       │  Frontend   │    │     API     │    │   Gateway   │
       │   Next.js   │    │ Node/Express│    │  WebSocket  │
       │    :3000    │    │    :3001    │    │    :3000    │
       └─────────────┘    └──────┬──────┘    └──────┬──────┘
                                 │                  │
                                 │ Kubernetes API   │
                                 │                  │
                                 ▼                  │
                         ┌───────────────┐          │
                         │  Kubernetes   │          │
                         │   Resources   │          │
                         └───────┬───────┘          │
                                 │                  │
                                 ▼                  ▼
                         ┌───────────────┐    ┌───────────────┐
                         │ Worker Pod    │◄───│ Worker Service│
                         │               │    │   ClusterIP   │
                         │ Code Runtime  │    └───────────────┘
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │      PVC      │
                         │   Workspace   │
                         └───────────────┘
```

---

# Key Features

- Dynamic Kubernetes workspace provisioning
- Isolated worker environment per project
- Project-specific Kubernetes Deployment
- Project-specific Kubernetes Service
- Project-specific PersistentVolumeClaim
- Real-time WebSocket communication
- Dedicated WebSocket gateway
- Project-level WebSocket authentication
- Kubernetes-native service discovery
- Persistent workspace storage
- Workspace restoration from object storage
- Periodic workspace synchronization
- Dockerized application services
- Local Kubernetes development using KIND
- Production deployment using Civo Managed Kubernetes
- NGINX Ingress-based HTTP and WebSocket routing
- HTTPS/WSS support
- Kubernetes RBAC for backend cluster access
- Clerk-based application authentication

---

# Architecture

## High-Level Architecture

![Architecture Diagram](project-documentation/images/codeio-archetecture.svg)

---

# Request Flow

There are two major request flows in CodeIO:

1. Normal application/API requests
2. Workspace WebSocket requests

## 1. Application Request

```text
User
 │
 │ HTTPS
 ▼
NGINX Ingress
 │
 ├──────────────► Frontend
 │
 └── /api ──────► Node.js API
                       │
                       ├── MongoDB
                       ├── Redis
                       ├── Object Storage
                       └── Kubernetes API
```

The frontend communicates with the Node.js backend through the Kubernetes Service exposed by the Ingress.

## 2. Workspace WebSocket Request

When a project is created, the backend creates the required Kubernetes resources.

After the worker becomes ready, the backend generates a project-specific connection token.

The frontend then establishes a WebSocket connection:

```text
wss://<project-id>.ws.codeio.amangupta.work?token=<token>
```

The request flows through:

```text
User
 │
 │ WSS
 ▼
DNS
 │
 ▼
Civo LoadBalancer
 │
 ▼
NGINX Ingress
 │
 ▼
Workspace Gateway
 │
 │ Validate token
 │ Identify project
 ▼
Worker Service
 │
 ▼
Worker Pod
```

The worker pod itself is not directly exposed to the public internet.

---

# Workspace Lifecycle

A workspace is created dynamically when a user creates a project.

## Step 1 - Project Creation

The frontend sends a request to the Node.js API.

```text
Frontend
   │
   ▼
Node.js API
```

The API authenticates the request and begins provisioning the workspace.

---

## Step 2 - Kubernetes Resources

The backend dynamically creates:

```text
PersistentVolumeClaim
Deployment
Service
```

For example:

```text
worker-<project-id>

worker-svc-<project-id>

workspace-pvc-<project-id>
```

---

## Step 3 - Worker Pod

The Deployment creates the worker pod.

The worker environment contains:

```text
Worker Container
Workspace Sync Container
```

An init container is also used to restore the workspace when required.

---

## Step 4 - Workspace Restoration

The init container checks whether the workspace contains existing files.

If the workspace is empty, it restores the project from object storage.

```text
Object Storage
      │
      │ Restore
      ▼
Init Container
      │
      ▼
PersistentVolume
      │
      ▼
/workspace
```

---

## Step 5 - Wait for Readiness

The API waits until the worker pod reaches:

```text
Ready = True
```

Only after the worker is ready is the workspace considered available.

---

## Step 6 - Generate Connection Token

The backend generates a token for the workspace connection.

The frontend uses that token to establish the WebSocket connection.

---

## Step 7 - WebSocket Connection

```text
Frontend
    │
    │ WSS
    ▼
Gateway
    │
    │ Authenticate
    │ Identify project
    ▼
worker-svc-<project-id>
    │
    ▼
Worker Pod
```

---

## Step 8 - Project Deletion

When the project is deleted, the backend cleans up the Kubernetes resources.

The cleanup flow is:

```text
Deployment
    │
    ▼
Wait for worker pod deletion
    │
    ▼
Service
    │
    ▼
PersistentVolumeClaim
```

This prevents the PVC from being deleted while the worker pod is still using it.

---

# WebSocket Architecture

A dedicated gateway service is used as the public entry point for workspace WebSocket connections.

The gateway provides a layer between public clients and private worker services.

```text
                    Public Internet
                          │
                          │ WSS
                          ▼
                ┌──────────────────┐
                │  NGINX Ingress   │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │ Workspace Gateway│
                └────────┬─────────┘
                         │
                  Authentication
                         │
                   Project ID
                         │
                         ▼
                ┌──────────────────┐
                │ Worker Service   │
                │    ClusterIP     │
                └────────┬─────────┘
                         │
                         ▼
                   Worker Pod
```

The gateway is responsible for:

- Authenticating workspace requests
- Validating project tokens
- Identifying the target project
- Routing traffic to the correct worker service
- Keeping worker services private

---

# Kubernetes Architecture

CodeIO uses Kubernetes as the execution environment.

## Permanent Services

The cluster contains three main application services:

```text
codeio-frontend
codeio-api
codeio-workspace-gateway
```

Each is deployed as a Kubernetes Deployment and exposed using a Kubernetes Service.

---

## Dynamic Worker Resources

Worker resources are created per project.

For a project ID such as:

```text
6a7e0d49b8eaac9b563d9342
```

the backend creates resources such as:

```text
Deployment:
worker-6a7e0d49b8eaac9b563d9342

Service:
worker-svc-6a7e0d49b8eaac9b563d9342

PVC:
workspace-pvc-6a7e0d49b8eaac9b563d9342
```

This provides project-level isolation.

---

# Kubernetes Service Discovery

Worker services use Kubernetes `ClusterIP`.

The gateway/backend can communicate with a worker through Kubernetes DNS:

```text
worker-svc-<project-id>.codeio.svc.cluster.local
```

This means individual worker services do not need public IP addresses or NodePorts.

---

# Workspace Persistence

Worker pods are treated as disposable compute environments.

The project workspace is mounted into the worker at:

```text
/workspace
```

The workspace is backed by a Kubernetes PersistentVolumeClaim.

```text
Worker Pod
    │
    │ mount
    ▼
 /workspace
    │
    ▼
PersistentVolumeClaim
```

The platform also uses object storage to restore and synchronize workspace data.

This provides an additional persistence layer when worker environments are recreated.

---

# Workspace Sync

The worker deployment contains a dedicated synchronization container.

The architecture is:

```text
                 ┌───────────────────┐
                 │    Worker Pod     │
                 │                   │
                 │ ┌───────────────┐ │
                 │ │ Worker        │ │
                 │ │ Container     │ │
                 │ └───────┬───────┘ │
                 │         │         │
                 │         │         │
                 │ ┌───────▼───────┐ │
                 │ │ Workspace     │ │
                 │ │ Sync          │ │
                 │ │ Container     │ │
                 │ └───────┬───────┘ │
                 │         │         │
                 └─────────┼─────────┘
                           │
                           ▼
                     Object Storage
```

Both containers share the same workspace volume.

---

# Security

## Authentication

Application authentication is handled using Clerk.

Protected backend APIs require authenticated users.

---

## Workspace Authentication

Workspace WebSocket connections include a project-specific token.

The gateway validates the token before forwarding the connection to the worker.

```text
WebSocket Request
       │
       ▼
    Gateway
       │
       ├── Validate token
       │
       ├── Identify project
       │
       ▼
    Worker
```

---

## Worker Isolation

Each project gets its own worker environment.

Workers are accessed through internal Kubernetes Services.

The worker service is not directly exposed publicly.

---

## Kubernetes RBAC

The backend communicates with the Kubernetes API using the Kubernetes Node.js client.

In production, the backend runs inside Kubernetes and uses a Kubernetes ServiceAccount.

The ServiceAccount is granted only the permissions required for the backend to manage project resources.

```text
Node.js API
    │
    ▼
ServiceAccount
    │
    ▼
RBAC
    │
    ▼
Kubernetes API
```

---

# Networking

## Production Domains

Main application:

```text
https://codeio.amangupta.work
```

WebSocket connections:

```text
wss://<project-id>.ws.codeio.amangupta.work
```

The wildcard WebSocket subdomain is routed to the workspace gateway.

---

## Ingress

NGINX Ingress is used to route traffic.

Conceptually:

```text
codeio.amangupta.work
        │
        ├── /
        │     └── Frontend
        │
        └── /api
              └── API


<project-id>.ws.codeio.amangupta.work
        │
        └── /
              └── Workspace Gateway
```

The Ingress also handles WebSocket traffic and TLS termination.

---

# HTTPS / WSS

Production traffic uses encrypted protocols:

```text
HTTPS
WSS
```

TLS certificates are managed using cert-manager.

The architecture is:

```text
Client
  │
  │ HTTPS / WSS
  ▼
LoadBalancer
  │
  ▼
NGINX Ingress
  │
  ▼
Application Services
```

---

# Resource Management

The permanent application services currently use the following resource configuration:

```yaml
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"

  limits:
    cpu: "500m"
    memory: "512Mi"
```

Worker resources are configured separately because worker pods execute user workloads.

The current deployment is intentionally sized for a small portfolio/demo workload.

The worker system is also being limited to a small number of concurrent environments to prevent uncontrolled resource consumption.

Current target:

```text
Maximum concurrent workers: 3–4
```

---

# Infrastructure

## Local Kubernetes

Local Kubernetes development uses:

```text
KIND
```

KIND allows the production Kubernetes architecture to be tested locally before deploying to the managed cluster.

Docker images are built locally and loaded into KIND.

---

## Production Kubernetes

Production runs on:

```text
Civo Managed Kubernetes
```

Current cluster configuration:

```text
Cluster type: K3s
CPU:          2
Memory:       4 GB
CNI:          Cilium
```

Additional components currently used include:

```text
NGINX Ingress
cert-manager
Metrics Server
```

---

# Load Balancer

The Civo Kubernetes cluster uses a LoadBalancer to expose the NGINX Ingress controller.

The traffic flow is:

```text
Internet
   │
   ▼
DNS
   │
   ▼
Civo LoadBalancer
   │
   ▼
NGINX Ingress
   │
   ▼
Kubernetes Services
```

---

# Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Clerk
- Monaco Editor
- xterm

## Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Redis
- Kubernetes API
- WebSockets
- Socket.IO
- node-cron

## Infrastructure

- Docker
- Kubernetes
- KIND
- Civo Kubernetes
- K3s
- NGINX Ingress
- Cilium
- cert-manager
- Metrics Server

## Storage

- MongoDB
- Kubernetes PersistentVolumeClaims
- Cloudflare R2 / S3-compatible object storage

## Monorepo

- Turborepo
- pnpm

---

# Project Structure

```text
codeio/
│
├── apps/
│   │
│   ├── codeio-frontend/
│   │   └── Next.js frontend
│   │
│   ├── codeio-api/
│   │   └── Node.js backend
│   │
│   └── workspace-gateway/
│       └── WebSocket gateway
│
├── packages/
│   └── Shared packages
│
├── k8s/
│   ├── namespace/
│   ├── deployments/
│   ├── ingress/
│   ├── secrets/
│   └── ...
│
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

TODO: Update the `packages/` and `k8s/` sections with the exact directory structure from the repository.

---

# Dockerization

The application services are containerized using multi-stage Docker builds.

The monorepo uses Turborepo pruning to reduce the Docker build context and install only the dependencies required by the target application.

The general build process is:

```text
Repository
    │
    ▼
Turbo Prune
    │
    ▼
Install Dependencies
    │
    ▼
Build Application
    │
    ▼
Runtime Image
```

This approach keeps the Docker build focused on the target application while still supporting workspace dependencies.

---

# Engineering Decisions

## Why Kubernetes?

Kubernetes provides the primitives required to dynamically create isolated execution environments.

Each project can receive:

```text
Deployment
Service
PersistentVolumeClaim
```

This makes Kubernetes a natural fit for managing dynamically created worker environments.

---

## Why a Dedicated Gateway?

Instead of exposing worker services directly, CodeIO uses a dedicated gateway.

This provides a centralized location for:

- Authentication
- Authorization
- Project identification
- WebSocket routing
- Connection management

It also means worker services can remain internal to the cluster.

---

## Why ClusterIP for Workers?

Worker services use `ClusterIP` because they do not need to be publicly accessible.

The gateway communicates with them using Kubernetes DNS.

This reduces the public attack surface and avoids creating a publicly reachable endpoint for every worker.

---

## Why PersistentVolumeClaims?

Worker pods are replaceable.

The filesystem used by a worker should not be tightly coupled to the lifetime of the pod.

Persistent storage allows workspace data to survive worker recreation.

---

## Why Object Storage?

Object storage provides another persistence layer for project workspaces.

It allows the workspace to be restored when a new worker environment is created.

The current implementation uses an S3-compatible object storage API.

---

## Why KIND?

KIND provides a lightweight local Kubernetes environment.

It allows the same Kubernetes concepts used in production to be tested locally:

```text
Deployments
Services
PVCs
Ingress
RBAC
ServiceAccounts
```

This helps maintain local/production parity.

---

# Challenges

## Dynamic Resource Provisioning

One of the main challenges was dynamically creating and cleaning up Kubernetes resources from a Node.js application.

The backend uses:

```text
@kubernetes/client-node
```

to communicate with the Kubernetes API.

The application creates and manages Kubernetes resources programmatically rather than relying entirely on static manifests.

---

## Pod Readiness

Creating a Deployment does not mean the workspace is immediately usable.

The backend therefore waits for the worker pod to reach:

```text
Ready = True
```

before allowing the workspace to be used.

This prevents race conditions where the frontend attempts to connect before the worker is ready.

---

## Workspace Persistence

Worker pods can be recreated.

To avoid losing project files, workspace data is stored independently of the worker process.

The system combines:

```text
PVC
+
Object Storage
+
Workspace Sync
```

to provide persistence.

---

## WebSocket Routing

Traditional HTTP routing is relatively straightforward because the target service is usually known in advance.

With project-specific workspaces, the gateway must determine which worker belongs to the incoming project.

The project ID is therefore encoded into the WebSocket hostname:

```text
<project-id>.ws.codeio.amangupta.work
```

The gateway uses this project identity to route the connection to:

```text
worker-svc-<project-id>.codeio.svc.cluster.local
```

---

# Scalability

The worker architecture is designed around dynamic provisioning.

Conceptually:

```text
Active Projects
      │
      ▼
Worker Pods
```

For example:

```text
1 active project → 1 worker
2 active projects → 2 workers
3 active projects → 3 workers
```

The current production deployment is intentionally constrained because the application is primarily a portfolio project.

The worker concurrency is currently planned to be limited to approximately:

```text
3–4 concurrent workers
```

This prevents a small Kubernetes cluster from being overwhelmed by unbounded user workloads.

---

# Monitoring

The production Kubernetes cluster currently has the Kubernetes Metrics Server installed.

This provides basic resource metrics for:

```text
Pods
Nodes
CPU
Memory
```

---

# Author

## Aman Gupta

Senior Software Development Engineer

- [GitHub](https://github.com/Aman-Gupta-404)
- [LinkedIn](https://www.linkedin.com/in/amangupta3/)
<!-- - [Portfolio / Personal Website](https://your-website.com) -->

---
