terraform {
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
  }
  required_version = ">= 1.0"
}

provider "hcloud" {
  token = var.hcloud_token
}

# Generate SSH key pair
resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Upload SSH public key to Hetzner
resource "hcloud_ssh_key" "default" {
  name       = var.ssh_key_name
  public_key = tls_private_key.ssh_key.public_key_openssh
}

# Create firewall
resource "hcloud_firewall" "k3s_firewall" {
  name = "k3s-firewall"

  # SSH
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "22"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  # HTTP
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "80"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  # HTTPS
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "443"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }

  # K3s API
  rule {
    direction = "in"
    protocol  = "tcp"
    port      = "6443"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }
}

# Create server with K3s installation
resource "hcloud_server" "k3s" {
  name        = var.server_name
  server_type = var.server_type
  location    = var.location
  image       = "ubuntu-22.04"
  ssh_keys    = [hcloud_ssh_key.default.id]
  firewall_ids = [hcloud_firewall.k3s_firewall.id]

  user_data = templatefile("${path.module}/cloud-init.yaml", {
    k3s_version = "v1.28.5+k3s1"
  })

  labels = {
    type = "k3s-server"
  }
}

# Wait for K3s to be ready
resource "null_resource" "wait_for_k3s" {
  depends_on = [hcloud_server.k3s]

  provisioner "local-exec" {
    command = "sleep 60"
  }
}

# Fetch kubeconfig
resource "null_resource" "fetch_kubeconfig" {
  depends_on = [null_resource.wait_for_k3s]

  provisioner "local-exec" {
    command = <<-EOT
      ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
        -i ${path.module}/ssh_key.pem \
        root@${hcloud_server.k3s.ipv4_address} \
        'cat /etc/rancher/k3s/k3s.yaml' | \
        sed 's/127.0.0.1/${hcloud_server.k3s.ipv4_address}/g' > ${path.module}/kubeconfig.yaml
    EOT
  }

  triggers = {
    server_id = hcloud_server.k3s.id
  }
}

# Save SSH private key locally
resource "local_file" "ssh_private_key" {
  content         = tls_private_key.ssh_key.private_key_pem
  filename        = "${path.module}/ssh_key.pem"
  file_permission = "0600"
}

