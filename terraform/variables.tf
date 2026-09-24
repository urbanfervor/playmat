variable "project_id" {
  type    = string
  default = "your-gcp-project"
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "service_name" {
  type    = string
  default = "playmat-web"
}

variable "domain" {
  type    = string
  default = "playmat.example.com"
}

variable "github_owner" {
  type    = string
  default = "urbanfervor"
}

variable "github_repo" {
  type    = string
  default = "playmat"
}

variable "livekit_url" {
  description = "LiveKit Cloud websocket URL. Baked into the client bundle at build time."
  type        = string
  default     = "wss://your-project.livekit.cloud"
}

variable "email_from" {
  description = "Sender for want-to-play alert emails. The domain must be verified in Resend."
  type        = string
  default     = "Playmat <alerts@example.com>"
}

variable "admin_email" {
  description = "Gets an email for every new table and want-to-play registration."
  type        = string
  default     = "admin@example.com"
}

# Both depend on manual steps (README). Set false to apply before those are done.
variable "create_build_trigger" {
  description = "Requires the GitHub repo to be connected to Cloud Build."
  type        = bool
  default     = true
}

variable "map_domain" {
  description = "Requires the domain to be verified in Google Search Console."
  type        = bool
  default     = true
}
