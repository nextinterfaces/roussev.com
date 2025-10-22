variable "hcloud_token" {
  description = "Hetzner Cloud API Token"
  type        = string
  sensitive   = true
}

variable "server_name" {
  description = "Name of the server"
  type        = string
  default     = "k3s-server"
}

variable "server_type" {
  description = "Server type (cheapest option: cpx11)"
  type        = string
  default     = "cpx11"
}

variable "location" {
  description = "Server location (ash = Ashburn, VA, USA)"
  type        = string
  default     = "ash"
}

variable "ssh_key_name" {
  description = "Name for the SSH key"
  type        = string
  default     = "k3s-key"
}

