variable "project_id" {
  type    = string
  default = "sixth-oxygen"
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
  default = "playmat.vada.games"
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
  default     = "wss://urbanfervor-l3ajxdoo.livekit.cloud"
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
