# EKS Setup Guide

## 1️⃣ Install kubectl

```bash
# Download kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Make it executable
chmod +x kubectl

# Move to /usr/local/bin
sudo mv kubectl /usr/local/bin/

# Verify installation
kubectl version --client
```

---

## 2️⃣ Install eksctl

```bash
# Download eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp

# Move binary to /usr/local/bin
sudo mv /tmp/eksctl /usr/local/bin

# Verify installation
eksctl version
```

---

## 3️⃣ Create EKS Cluster

```bash
eksctl create cluster \
  --name notes-app-cluster \
  --region ap-south-1 \
  --nodes 2 \
  --node-type t3.medium \
  --managed
```

* **--name**: Cluster name
* **--region**: AWS region (ap-south-1)
* **--nodes**: Number of worker nodes
* **--node-type**: EC2 instance type
* **--managed**: Use managed node group

> This process may take 10–15 minutes.

---

## 4️⃣ Update kubeconfig

```bash
aws eks --region ap-south-1 update-kubeconfig --name notes-app-cluster
```

* This updates your local kubeconfig file so `kubectl` can access the cluster.

---

## 5️⃣ Verify Cluster

```bash
kubectl get nodes
kubectl get pods -A
```

* You should see your worker nodes and system pods.

---

## 6️⃣ Install NGINX Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Verify Ingress controller pods
kubectl get pods -n ingress-nginx
```

---

## 7️⃣ Install cert-manager

```bash
# Add cert-manager CRDs
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.3/cert-manager.yaml

# Verify cert-manager pods
kubectl get pods -n cert-manager
```

---

## 8️⃣ Optional: Install Metrics Server

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl get pods -n kube-system
```

---

## 9️⃣ Next Steps

* Deploy your application manifests:

```bash
kubectl apply -f db.yml
kubectl apply -f backend.yml
kubectl apply -f frontend.yml
kubectl apply -f ingress.yml
kubectl apply -f cluster-issuer.yml
```

* Access your application using the LoadBalancer DNS or configured domain.

---

## 🔴 Cleanup Steps

If you want to remove everything and free resources:

1. **Delete the EKS cluster**

```bash
eksctl delete cluster --name notes-app-cluster --region ap-south-1
```

2. **Delete kubeconfig entry (optional)**

```bash
kubectl config delete-context notes-app-cluster
kubectl config delete-cluster notes-app-cluster
```

3. **Delete any remaining AWS resources** (like LoadBalancers, security groups) that were provisioned outside the cluster, if needed.

4. **Remove local binaries** (optional)

```bash
sudo rm /usr/local/bin/kubectl
sudo rm /usr/local/bin/eksctl
```
