output "service_url" {
  value = google_cloud_run_v2_service.web.uri
}

output "domain_dns_records" {
  description = "Create these at your DNS provider for the custom domain."
  value       = var.map_domain ? google_cloud_run_domain_mapping.web[0].status[0].resource_records : null
}

output "env_local" {
  description = "Public config for .env.local. Secrets come from Secret Manager, see README."
  value       = <<-EOT
    NEXT_PUBLIC_FIREBASE_API_KEY=${data.google_firebase_web_app_config.playmat.api_key}
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${data.google_firebase_web_app_config.playmat.auth_domain}
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=${var.project_id}
    NEXT_PUBLIC_FIREBASE_APP_ID=${google_firebase_web_app.playmat.app_id}
    NEXT_PUBLIC_LIVEKIT_URL=${var.livekit_url}
  EOT
}

output "firebase_api_key" {
  value = data.google_firebase_web_app_config.playmat.api_key
}

output "firebase_app_id" {
  value = google_firebase_web_app.playmat.app_id
}
