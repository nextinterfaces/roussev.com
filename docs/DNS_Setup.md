# DNS Setup for roussev.com with Hetzner DNS

This guide explains how to configure DNS for `roussev.com` to point to your K3s cluster on Hetzner Cloud.

---

## Prerequisites

- Domain name (roussev.com)
- Hetzner Cloud account with API token
- Terraform installed locally
- kubectl installed locally

---

```bash
terraform output server_ip
```

**Save the server IP** - you'll need it for DNS configuration in the next step.

---

## Step 2: Configure DNS

### Update Existing DNS Record

If you already have roussev.com configured in Hetzner DNS, simply update the A record:

#### Steps

1. **Go to Hetzner DNS Console:** https://dns.hetzner.com/
2. **Log in** with your Hetzner account
3. **Click on zone:** `roussev.com`
4. **Find the A record** for `@` or `roussev.com`
5. **Edit the record:**
   - **Name:** `@` (or leave blank for root domain)
   - **Type:** `A`
   - **Value:** Your K3s server IP (e.g., `178.156.207.109`)
   - **TTL:** `300`
6. **Click Save**

#### Verify DNS Update

Wait 2-5 minutes, then check:

```bash
# Check from Google DNS
dig @8.8.8.8 roussev.com A +short

# Check from Cloudflare DNS
dig @1.1.1.1 roussev.com A +short

# Should return your K3s server IP
```

---

### Create New DNS Zone (First Time Setup)

If you're setting up Hetzner DNS for the first time:

#### Step 1: Create DNS Zone in Hetzner

1. Go to https://dns.hetzner.com
2. Click **Add a DNS Zone** → Enter `roussev.com`
3. Hetzner will create a zone with default NS records:
   ```
   helium.ns.hetzner.de
   oxygen.ns.hetzner.com
   hydrogen.ns.hetzner.com
   ```

#### Step 2: Update Name Servers at Your Registrar

1. Log in to your domain registrar (where you purchased roussev.com)
2. Navigate to DNS or Name Server settings
3. Replace existing name servers with:
   ```
   Name Server 1: helium.ns.hetzner.de
   Name Server 2: oxygen.ns.hetzner.com
   Name Server 3: hydrogen.ns.hetzner.com
   ```
4. Save changes

#### Step 3: Add DNS Records in Hetzner

1. Return to the Hetzner DNS Console
2. Under your `roussev.com` zone, add the following record:

   | Type | Name | Value                | TTL  |
   |------|------|----------------------|------|
   | A    | @    | Your K3s server IP   | 300  |

3. **(Optional)** Add subdomains:

   | Type | Name | Value                | TTL  |
   |------|------|----------------------|------|
   | A    | api  | Your K3s server IP   | 300  |
   | A    | k3s  | Your K3s server IP   | 300  |

#### Step 4: Verify DNS Propagation

Check name servers:
```bash
dig +short roussev.com NS
```

Expected output:
```
helium.ns.hetzner.de.
oxygen.ns.hetzner.com.
hydrogen.ns.hetzner.com.
```

Check A record:
```bash
dig +short roussev.com A
```

Expected output:
```
<your-k3s-server-ip>
```

Or check online: https://dnschecker.org/#A/roussev.com

---

## Troubleshooting

### DNS Not Updating

**Problem:** Local DNS still shows old IP address

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

- **Wait:** DNS propagation can take up to 24 hours globally
- **Check multiple locations:** Use https://dnschecker.org to see propagation status
- **Test with specific DNS servers:** Use `dig @8.8.8.8` to bypass local cache

### Test Before DNS Fully Propagates

You can test your service before DNS propagates using the `--resolve` flag:

```bash
curl https://roussev.com/api --resolve roussev.com:443:<your-k3s-ip>
```

---

---

## Step 3: Next Steps

After DNS is configured, proceed to SSL/TLS setup:

**Continue to:** [TLS_setup.md](TLS_setup.md) for SSL certificate configuration

---

## Reference

- **Hetzner DNS Console:** https://dns.hetzner.com/
- **DNS Checker:** https://dnschecker.org/
- **Hetzner DNS Documentation:** https://docs.hetzner.com/dns-console/
- **Quick Start Guide:** [../QUICK_START.md](../QUICK_START.md)

