output "server_ip" {
  description = "Public IP address of the K3s server"
  value       = hcloud_server.k3s.ipv4_address
}

output "server_name" {
  description = "Name of the K3s server"
  value       = hcloud_server.k3s.name
}

output "ssh_command" {
  description = "SSH command to connect to the server"
  value       = "ssh -i ${path.module}/ssh_key.pem root@${hcloud_server.k3s.ipv4_address}"
}

output "kubeconfig_path" {
  description = "Path to the kubeconfig file"
  value       = "${path.module}/kubeconfig.yaml"
}

output "domain" {
  description = "Domain for accessing services"
  value       = "roussev.com"
}

output "sample_service_url" {
  description = "URL to access the sample REST service"
  value       = "https://roussev.com/api"
}

output "dns_instructions" {
  description = "DNS configuration instructions"
  value       = <<-EOT
    Configure your DNS with the following A record:

    Domain: roussev.com
    Type: A
    Value: ${hcloud_server.k3s.ipv4_address}
    TTL: 300 (or Auto)

    Verify DNS propagation:
    dig @8.8.8.8 roussev.com A
  EOT
}

