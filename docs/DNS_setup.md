# DNS Setup with Hetzner DNS

## Prerequisites

- Domain name (e.g., roussev.com)
- Hetzner Cloud account with API token
- Terraform installed locally
- kubectl installed locally

---

## Step 1: Get Server IP

After deploying infrastructure with Terraform, retrieve server IP:

```bash
terraform output server_ip
```

**Save this IP address** - you'll need it for DNS configuration in the next step.

---

## Step 2: Configure DNS

### Option A: Update Existing DNS Record

If you already have domain configured in Hetzner DNS, simply update the A record:

#### Steps

1. Go to **Hetzner DNS Console**: https://dns.hetzner.com/
2. Log in with Hetzner account
3. Click on DNS zone (e.g., `roussev.com`)
4. Find the A record for `@` or your root domain
5. Edit the record:
   - **Name:** `@` (or leave blank for root domain)
   - **Type:** `A`
   - **Value:** Your K3s server IP (e.g., `178.156.207.109`)
   - **TTL:** `300` (5 minutes)
6. Click **Save**

#### Verify DNS Update

Wait 2-5 minutes for the change to propagate, then verify:

```bash
# Check from Google DNS
dig @8.8.8.8 roussev.com A +short

# Check from Cloudflare DNS
dig @1.1.1.1 roussev.com A +short

# Should return your K3s server IP
```

---

### Option B: Create New DNS Zone (First Time Setup)

If you're setting up Hetzner DNS for the first time:

#### Step 1: Create DNS Zone in Hetzner

1. Go to https://dns.hetzner.com
2. Click **Add a DNS Zone** and enter your domain (e.g., `roussev.com`)
3. Hetzner will create a zone with default nameserver records:
   ```
   helium.ns.hetzner.de
   oxygen.ns.hetzner.com
   hydrogen.ns.hetzner.com
   ```

#### Step 2: Update Nameservers at Your Domain Registrar

1. Log in to your domain registrar (where you purchased your domain)
2. Navigate to DNS or Nameserver settings
3. Replace existing nameservers with Hetzner's nameservers:
   ```
   Name Server 1: helium.ns.hetzner.de
   Name Server 2: oxygen.ns.hetzner.com
   Name Server 3: hydrogen.ns.hetzner.com
   ```
4. Save the changes

#### Step 3: Add DNS Records in Hetzner

1. Return to the Hetzner DNS Console
2. Under your DNS zone, add the following A record:

   | Type | Name | Value                | TTL  |
   |------|------|----------------------|------|
   | A    | @    | Your K3s server IP   | 300  |

3. **(Optional)** Add subdomain records:

   | Type | Name | Value                | TTL  |
   |------|------|----------------------|------|
   | A    | api  | Your K3s server IP   | 300  |
   | A    | k3s  | Your K3s server IP   | 300  |

#### Step 4: Verify DNS Propagation

Verify nameservers are updated:
```bash
dig +short roussev.com NS
```

Expected output:
```
helium.ns.hetzner.de.
oxygen.ns.hetzner.com.
hydrogen.ns.hetzner.com.
```

Verify A record is resolving:
```bash
dig +short roussev.com A
```

Expected output:
```
<your-k3s-server-ip>
```

You can also check propagation status online: https://dnschecker.org/#A/roussev.com

---

## Troubleshooting

### DNS Not Updating

**Problem:** Local DNS still shows the old IP address

**Solution:**
```bash
# Check global DNS (should show new IP)
dig @8.8.8.8 roussev.com A +short

# Check local DNS (might be cached)
dig roussev.com A +short

# Clear local DNS cache (macOS)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Clear local DNS cache (Linux)
sudo systemd-resolve --flush-caches

# Clear local DNS cache (Windows)
ipconfig /flushdns
```

### DNS Propagation Taking Too Long

- **Wait:** DNS propagation can take up to 24-48 hours globally
- **Check multiple locations:** Use https://dnschecker.org to monitor propagation status
- **Test with specific DNS servers:** Use `dig @8.8.8.8` to bypass your local cache

### Test Before DNS Fully Propagates

You can test your service before DNS propagates:

```bash
# Get server IP
SERVER_IP=$(cd terraform && terraform output -raw server_ip)

# Test with explicit IP resolution
curl https://roussev.com/api --resolve roussev.com:443:$SERVER_IP

# Or test with IP and Host header (for HTTP testing)
curl http://$SERVER_IP/api -H "Host: roussev.com"
```

---

## Next Steps

After DNS is configured and verified, proceed to TLS setup:

**Continue to:** [TLS_setup.md](TLS_setup.md) for SSL certificate configuration