# K3s HTTPS & TLS Setup on Hetzner with cert-manager and Let's Encrypt

This guide documents how to configure HTTPS for your K3s services using **cert-manager** and **Let's Encrypt** (production environment).  
The example uses the domain `roussev.com` and assumes DNS is hosted in **Hetzner DNS**.

---

Apply:
```bash
export KUBECONFIG=./terraform/kubeconfig.yaml
# install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml"
kubectl wait --namespace cert-manager --for=condition=ready pod --selector=app.kubernetes.io/instance=cert-manager --timeout=300s
# deploy letsencrypt-issuer
kubectl apply -f k8s/letsencrypt-issuer.yaml

# troubleshooting
kubectl get certificate -n sample-app
kubectl describe certificate sample-rest-tls -n sample-app
kubectl get ingress sample-rest-ingress -n sample-app -o yaml | grep -A 5 "annotations:"
curl -k https://roussev.com/api
cd terraform && terraform output -raw server_ip
curl -k https://178.156.207.109/api -H "Host: roussev.com"
dig @8.8.8.8 roussev.com A +short

kubectl delete certificate sample-rest-tls -n sample-app 
kubectl delete secret sample-rest-tls -n sample-app
kubectl apply -f k8s/sample-service.yaml

kubectl annotate ingress sample-rest-ingress -n sample-app cert-manager.io/cluster-issuer=letsencrypt-prod --overwrite

kubectl get certificate -n sample-app
kubectl describe certificate sample-rest-tls -n sample-app | grep -A 5 "Issuer Ref"
```

Check:
```bash
kubectl get clusterissuer
```

Expected:
```
NAME               READY   AGE
letsencrypt-prod   True    10s
letsencrypt-staging True   10s
```

---

## 4. Verify Certificate Issuance

Watch the certificate creation:
```bash
kubectl get certificates -A -w
```

Expected:
```
NAMESPACE    NAME              READY   SECRET            AGE
sample-app   sample-rest-tls   True    sample-rest-tls   2m
```

Describe it:
```bash
kubectl describe certificate -n sample-app sample-rest-tls
```

Look for:
```
Message: Certificate is up to date and has not expired
Reason: Ready
Not After: <90 days from issue>
```

---

## 5. Verify HTTPS Access

Once issued, test your endpoint:
```bash
curl -v https://roussev.com/api
```

Expected:
```
* SSL connection using TLSv1.3 / ECDHE-RSA-AES128-GCM-SHA256
* Server certificate verified OK
Hello from K3s on Hetzner! This is a sample REST API.
```

---

## 6. Auto-Renewal

Cert-manager will automatically renew certificates before expiry. You can check renewal logs:
```bash
kubectl logs -n cert-manager -l app=cert-manager -f
```

---

## ✅ Summary

| Component              | Description                                | Status |
|------------------------|--------------------------------------------|--------|
| cert-manager           | Manages certificate lifecycle              | ✅ |
| letsencrypt-prod       | ACME issuer using HTTP-01 challenge        | ✅ |
| sample-rest-ingress    | Routes HTTPS traffic to /api               | ✅ |
| sample-rest-tls Secret | Stores issued TLS certificate              | ✅ |
| roussev.com            | Domain pointing to Hetzner K3s IP          | ✅ |
