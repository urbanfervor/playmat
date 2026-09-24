# Terraform owns the secret containers only. Values are added as versions with
# gcloud (see README) so they never pass through tfvars or Terraform state.
locals {
  secrets = toset(["livekit-api-key", "livekit-api-secret", "anthropic-api-key", "vapid-public-key", "vapid-private-key"])
}

resource "google_secret_manager_secret" "app" {
  for_each  = local.secrets
  secret_id = "playmat-${each.key}"
  replication {
    auto {}
  }
  depends_on = [google_project_service.required]
}

# The first apply created versions from tfvars. Forget them from state without
# deleting them; they stay live as "latest" until rotated with gcloud.
removed {
  from = google_secret_manager_secret_version.app
  lifecycle {
    destroy = false
  }
}

resource "google_secret_manager_secret_iam_member" "runtime" {
  for_each  = local.secrets
  secret_id = google_secret_manager_secret.app[each.key].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime.email}"
}

# The Resend key lives in the project-wide `resend-api-key` secret, created by
# hand outside Terraform. Terraform only grants the runtime access to it.
resource "google_secret_manager_secret_iam_member" "resend" {
  project   = var.project_id
  secret_id = "resend-api-key"
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime.email}"
}
