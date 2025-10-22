# Setting up DNS for roussev.com with Hetzner DNS

Configure `roussev.com` to use **Hetzner DNS** and route traffic to your Hetzner K3s server.

---

## 3. Steps

### Step 1. Create a DNS Zone in Hetzner

1. Go to [https://dns.hetzner.com](https://dns.hetzner.com)
2. Click **Add a DNS Zone** → Enter `roussev.com`
3. Hetzner will create a zone with default NS records:
   ```
   helium.ns.hetzner.de
   oxygen.ns.hetzner.com
   hydrogen.ns.hetzner.com
   ```

---

### Step 2. Update Name Servers at your Registrar

4. Replace the existing records with:

   ```
   Name Server 1: helium.ns.hetzner.de
   Name Server 2: oxygen.ns.hetzner.com
   Name Server 3: hydrogen.ns.hetzner.com
   ```

5. Save changes.

⏱ **Propagation:** Changes take 1–24 hours to propagate globally.

---

### Step 3. Add DNS Records in Hetzner

1. Return to the Hetzner DNS Console.
2. Under your `roussev.com` zone, add the following record:

   | Type | Name | Value         | TTL  |
   |------|------|---------------|------|
   | A    | @    | <hetzner-ip-address>  | 300  |


3. (Optional) Add subdomains:

   | Type | Name | Value         | TTL  |
   |------|------|---------------|------|
   | A    | app  | <hetzner-ip-address>  | 300  |
   | A    | api  | <hetzner-ip-address>  | 300  |

### Step 4. Verify DNS Propagation

Run these commands:

```bash
dig +trace NS roussev.com
dig +short roussev.com NS
dig +short roussev.com A
```

Expected output:

```
helium.ns.hetzner.de.
oxygen.ns.hetzner.com.
hydrogen.ns.hetzner.com.
<hetzner-ip-address>
```

Or check online: [https://dnschecker.org/#A/roussev.com](https://dnschecker.org/#A/roussev.com)

