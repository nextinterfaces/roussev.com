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

output "sslip_domain" {
  description = "sslip.io domain for accessing services"
  value       = "${hcloud_server.k3s.ipv4_address}.sslip.io"
}

output "sample_service_url" {
  description = "URL to access the sample REST service"
  value       = "http://${hcloud_server.k3s.ipv4_address}.sslip.io/api"
}

