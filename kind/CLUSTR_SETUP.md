# KIND Kubernetes Cluster Setup on EC2

This guide explains how to:

- Install Docker
- Install kubectl
- Install KIND
- Verify installations
- Create a KIND Kubernetes cluster using `kind_config.yml`
- Verify the cluster
- Install NGINX Ingress Controller

---

# 📋 Prerequisites

EC2 Server Requirements:

| Resource | Recommended |
|---|---|
| RAM | 4 GB |
| Storage | 30 GB |
| OS | Ubuntu 22.04 |

---

# 📁 Directory Structure

```bash
~/notes-app/
├── kind/
│   ├── install_kind.sh
│   ├── install_kubectl.sh
│   └── kind_config.yml
```

---

# 🔐 Step 1 — Connect to EC2 Server

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

# 🐳 Step 2 — Install Docker

Update packages:

```bash
sudo apt update
```

Install Docker:

```bash
sudo apt install docker.io -y
```

Enable Docker:

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

Add current user to Docker group:

```bash
sudo usermod -aG docker $USER
```

Apply group changes:

```bash
newgrp docker
```

Verify Docker:

```bash
docker --version
```

Test Docker:

```bash
docker run hello-world
```

---

# ⚙️ Step 3 — Install kubectl

Move to KIND directory:

```bash
cd ~/notes-app/kind
```

Give execute permissions:

```bash
chmod +x install_kubectl.sh
```

Run installation script:

```bash
./install_kubectl.sh
```

Verify installation:

```bash
kubectl version --client
```

Expected output:

```txt
Client Version: v1.xx.x
```

---

# ⚙️ Step 4 — Install KIND

Give execute permissions:

```bash
chmod +x install_kind.sh
```

Run installation script:

```bash
./install_kind.sh
```

Verify KIND installation:

```bash
kind version
```

Expected output:

```txt
kind v0.xx.x
```

---

# 📄 Step 5 — Verify `kind_config.yml`

File location:

```bash
~/notes-app/kind/kind_config.yml
```

Recommended configuration:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4

networking:
  apiServerAddress: "0.0.0.0"
  apiServerPort: 6443

nodes:

  - role: control-plane
    image: kindest/node:v1.33.1

    extraPortMappings:

      - containerPort: 30080
        hostPort: 80
        protocol: TCP

      - containerPort: 30443
        hostPort: 443
        protocol: TCP

  - role: worker
    image: kindest/node:v1.33.1
```

---

# 🚀 Step 6 — Create KIND Cluster

Move to KIND directory:

```bash
cd ~/notes-app/kind
```

Create cluster:

```bash
kind create cluster \
  --name notes-app-cluster \
  --config kind_config.yml
```

Expected output:

```txt
Creating cluster "notes-app-cluster" ...
Ensuring node image ...
Preparing nodes ...
Writing configuration ...
Starting control-plane ...
Installing CNI ...
Installing StorageClass ...
Set kubectl context to "kind-notes-app-cluster"
```

---

# ✅ Step 7 — Verify Cluster

Check cluster nodes:

```bash
kubectl get nodes
```

Expected output:

```txt
NAME                                 STATUS
notes-app-cluster-control-plane     Ready
notes-app-cluster-worker            Ready
```

---

# 🔍 Check Cluster Info

```bash
kubectl cluster-info
```

Expected output:

```txt
Kubernetes control plane is running at ...
CoreDNS is running at ...
```

---

# 📦 Step 8 — Install NGINX Ingress Controller

Apply ingress controller:

```bash
kubectl apply -f \
https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

---

# ⏳ Wait for Ingress Controller

Check ingress pods:

```bash
kubectl get pods -n ingress-nginx
```

Wait until all pods are:

```txt
Running
```

Example:

```txt
ingress-nginx-controller-xxxxx   1/1   Running
```

---

# 🌐 Step 9 — Verify Port Mapping

Check listening ports:

```bash
sudo netstat -tulnp | grep -E '80|443'
```

Expected:

```txt
0.0.0.0:80
0.0.0.0:443
```

---

# 🔐 Step 10 — Configure EC2 Security Group

Allow these inbound ports:

| Port | Purpose |
|---|---|
| 22 | SSH |
| 80 | HTTP |
| 443 | HTTPS |

---

# 🧪 Step 11 — Test Kubernetes

Create test deployment:

```bash
kubectl create deployment nginx --image=nginx
```

Expose deployment:

```bash
kubectl expose deployment nginx --port=80 --type=ClusterIP
```

Check pods:

```bash
kubectl get pods
```

---

# 🛑 Delete KIND Cluster

If needed:

```bash
kind delete cluster --name notes-app-cluster
```

---

# 🔄 Recreate Cluster

```bash
kind create cluster \
  --name notes-app-cluster \
  --config kind_config.yml
```

---

# 📊 Useful Commands

---

## Get Nodes

```bash
kubectl get nodes
```

---

## Get Pods

```bash
kubectl get pods -A
```

---

## Get Services

```bash
kubectl get svc -A
```

---

## Describe Node

```bash
kubectl describe node
```

---

## Check Docker Containers

```bash
docker ps
```

---

# ⚠️ Troubleshooting

---

## KIND Cluster Creation Fails

Check Docker status:

```bash
sudo systemctl status docker
```

Restart Docker:

```bash
sudo systemctl restart docker
```

---

## kubectl Not Found

Check binary:

```bash
which kubectl
```

---

## KIND Not Found

Check binary:

```bash
which kind
```

---

## Ingress Not Accessible

Verify:

- EC2 Security Group allows port 80/443
- ingress-nginx pods are running
- KIND cluster is healthy

---

# 🎯 Final Verification

Run:

```bash
kubectl get nodes
kubectl get pods -A
kubectl cluster-info
```

If all components are running ✔️

Your Kubernetes cluster is ready for deployments.

---

# ✅ Environment Summary

| Component | Status |
|---|---|
| Docker | ✅ |
| kubectl | ✅ |
| KIND | ✅ |
| Kubernetes Cluster | ✅ |
| NGINX Ingress | ✅ |

---

# 🚀 Next Step

Deploy your application manifests:

```bash
kubectl apply -f k8s/
```

---