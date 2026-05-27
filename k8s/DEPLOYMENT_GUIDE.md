# Full Stack Application Deployment on Kubernetes

This guide explains how to deploy a full-stack application using Kubernetes with:

- Frontend (React)
- Backend (Node.js / Express)
- MongoDB
- Ingress Controller
- Kubernetes Secrets
- Persistent Storage

---

# 📁 Project Structure

```bash
k8s/
├── namespace.yml
├── secret.yml
├── mongo.yml
├── backend.yml
├── frontend.yml
├── ingress.yml
└── README.md
```

---

# 🛠 Prerequisites

Before deployment, ensure you have:

- Kubernetes Cluster
  - Minikube
  - EKS
  - AKS
  - GKE
  - K3s
- kubectl installed
- Docker images pushed to DockerHub or private registry
- NGINX Ingress Controller installed

---

# 🚀 Step 1 — Create Namespace

File: `namespace.yml`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: notes-app
```

Apply:

```bash
kubectl apply -f namespace.yml
```

Verify:

```bash
kubectl get ns
```

---

# 🔐 Step 2 — Add MongoDB Credentials

Your application requires the following environment variables:

| Variable | Description |
|---|---|
| MONGO_INITDB_ROOT_USERNAME | MongoDB admin username |
| MONGO_INITDB_ROOT_PASSWORD | MongoDB admin password |
| MONGO_INITDB_DATABASE | MongoDB database name |

---

# 🔑 Encode Credentials Using Base64

Kubernetes Secrets require Base64 encoded values.

## Example

```bash
echo -n 'username' | base64
echo -n 'change-password' | base64
echo -n 'your-database-name' | base64
```

Example output:

```txt
admin         -> YWRtaW4=
password123   -> cGFzc3dvcmQxMjM=
mydatabase    -> bXlkYXRhYmFzZQ==
```

---

# 🔒 Create Secret File

File: `secret.yml`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: notes-app

type: Opaque

data:
  MONGO_INITDB_ROOT_USERNAME: 
  MONGO_INITDB_ROOT_PASSWORD:
  MONGO_INITDB_DATABASE: 
```

Apply secret:

```bash
kubectl apply -f secret.yml
```

---
## 🔐 Secure Kubernetes Secret Management

For security best practices, avoid committing Kubernetes secrets directly into the Git repository.

Instead of storing sensitive credentials in `secret.yml`, create secrets manually on the Kubernetes cluster.

### Create Kubernetes Secret

Run the following command on the EC2 server:

```bash
kubectl create secret generic app-secrets \
  --from-literal=MONGO_INITDB_ROOT_USERNAME=admin \
  --from-literal=MONGO_INITDB_ROOT_PASSWORD=password123 \
  --from-literal=MONGO_INITDB_DATABASE=notes \
  -n notes-app
```

### Verify Secret

```bash
kubectl get secrets -n notes-app
```

### View Secret Details

```bash
kubectl describe secret app-secrets -n notes-app
```

> ⚠️ Never commit real passwords, tokens, or secrets to GitHub repositories.
>
> Recommended approaches for production:
>
> - GitHub Secrets
> - HashiCorp Vault
> - Kubernetes External Secrets
> - Sealed Secrets
> - AWS Secrets Manager
---

Verify:

```bash
kubectl get secrets -n notes-app
```

---

# 🗄 Step 3 — Deploy MongoDB

File: `mongo.yml`

This deployment includes:

- MongoDB container
- Persistent Volume Claim
- Internal Service

Apply:

```bash
kubectl apply -f mongo.yml
```

Verify:

```bash
kubectl get pods -n notes-app
kubectl get svc -n notes-app
```

---

# ⚙️ Step 4 — Configure Backend

Update your backend deployment image:

File: `backend.yml`

Replace:

```yaml
image: your-dockerhub/backend:latest
```

with:

```yaml
image: yourusername/backend:v1
```

---

# 🌐 Backend Environment Variables

The backend receives:

| Variable | Value |
|---|---|
| PORT | 5000 |
| MONGO_URI | Generated automatically |
| MONGO_INITDB_ROOT_USERNAME | From Secret |
| MONGO_INITDB_ROOT_PASSWORD | From Secret |
| MONGO_INITDB_DATABASE | From Secret |

Generated Mongo URI:

```txt
mongodb://username:password@mongo-service:27017/database?authSource=admin
```

---

# 🚀 Deploy Backend

```bash
kubectl apply -f backend.yml
```

Verify:

```bash
kubectl get deployment -n notes-app
kubectl get pods -n notes-app
```

---

# 🎨 Step 5 — Configure Frontend

Update frontend image:

File: `frontend.yml`

Replace:

```yaml
image: your-dockerhub/frontend:latest
```

with:

```yaml
image: yourusername/frontend:v1
```

---

# 🌍 Frontend Environment Variable

| Variable | Value |
|---|---|
| REACT_APP_API_URL | http://backend-service:5000 |

---

# 🚀 Deploy Frontend

```bash
kubectl apply -f frontend.yml
```

Verify:

```bash
kubectl get svc -n notes-app
```

---

# 🌐 Step 6 — Install NGINX Ingress Controller

Install ingress controller:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

Wait until ingress controller is running:

```bash
kubectl get pods -n ingress-nginx
```

---

# 🌍 Step 7 — Configure Ingress

File: `ingress.yml`

Replace:

```yaml
host: app.example.com
```

with your domain:

```yaml
host: myapp.com
```

---

# 🚀 Deploy Ingress

```bash
kubectl apply -f ingress.yml
```

Verify:

```bash
kubectl get ingress -n notes-app
```

---

# 🧪 Step 8 — Local Testing

Get ingress external IP:

```bash
kubectl get ingress -n notes-app
```

Example:

```txt
192.168.49.2
```

Edit hosts file:

Linux/macOS:

```bash
sudo nano /etc/hosts
```

Windows:

```txt
C:\Windows\System32\drivers\etc\hosts
```

Add:

```txt
192.168.49.2 app.example.com
```

Now open:

```txt
http://app.example.com
```

---

# 📦 Step 9 — Build and Push Docker Images

## Backend

```bash
docker build -t yourusername/backend:v1 ./backend
docker push yourusername/backend:v1
```

## Frontend

```bash
docker build -t yourusername/frontend:v1 ./frontend
docker push yourusername/frontend:v1
```

---

# 🔍 Useful Commands

## Get All Resources

```bash
kubectl get all -n notes-app
```

---

## View Logs

### Backend

```bash
kubectl logs deployment/backend -n notes-app
```

### Frontend

```bash
kubectl logs deployment/frontend -n notes-app
```

### MongoDB

```bash
kubectl logs deployment/mongo -n notes-app
```

---

## Restart Deployment

```bash
kubectl rollout restart deployment/backend -n notes-app
```

---

## Delete Everything

```bash
kubectl delete namespace notes-app
```

---

# 🔐 Security Recommendations

For production environments:

- Use TLS/HTTPS
- Install cert-manager
- Use External Secrets
- Enable RBAC
- Use Network Policies
- Add Resource Limits
- Add Liveness Probes
- Add Readiness Probes
- Use Private Container Registry

---

# 📈 Production Improvements

Recommended future improvements:

- Helm Charts
- GitOps (ArgoCD / FluxCD)
- CI/CD Pipelines
- Horizontal Pod Autoscaler
- Prometheus + Grafana Monitoring
- Loki Logging
- Redis Caching

---

# 🧰 Troubleshooting

---

## Pods Not Starting

Check pod events:

```bash
kubectl describe pod <pod-name> -n notes-app
```

---

## Image Pull Errors

Verify:

- Docker image exists
- DockerHub repository is public
- Correct image tag used

---

## MongoDB Connection Issues

Verify backend environment:

```bash
kubectl exec -it deployment/backend -n notes-app -- env
```

---

## Ingress Not Working

Check ingress controller:

```bash
kubectl get pods -n ingress-nginx
```

---

# ✅ Deployment Summary

| Component | Status |
|---|---|
| Namespace | ✅ |
| Secrets | ✅ |
| MongoDB | ✅ |
| Backend | ✅ |
| Frontend | ✅ |
| Ingress | ✅ |

---

# 🎉 Application Architecture

```txt
Internet
    ↓
Ingress
    ↓
Frontend Service
    ↓
Frontend Pods
    ↓
Backend Service
    ↓
Backend Pods
    ↓
MongoDB Service
    ↓
MongoDB Pod + Persistent Volume
```

---

# 👨‍💻 Author

DevOps Kubernetes Deployment Guide

---