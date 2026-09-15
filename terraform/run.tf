resource "google_service_account" "runtime" {
  account_id   = "playmat-web"
  display_name = "Playmat Cloud Run runtime"
}

resource "google_artifact_registry_repository" "playmat" {
  repository_id = "playmat"
  format        = "DOCKER"
  location      = var.region
  depends_on    = [google_project_service.required]
}

locals {
  image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.playmat.repository_id}/web"
}

# Cloud Build deploys new images with `gcloud run deploy`, so Terraform owns the
# service shape but ignores the image tag after creation.
resource "google_cloud_run_v2_service" "web" {
  name                = var.service_name
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_ALL"
  deletion_protection = false

  template {
    service_account = google_service_account.runtime.email
    scaling {
      max_instance_count = 3
    }

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello"

      ports {
        container_port = 3000
      }

      dynamic "env" {
        for_each = {
          LIVEKIT_API_KEY    = "livekit-api-key"
          LIVEKIT_API_SECRET = "livekit-api-secret"
          ANTHROPIC_API_KEY  = "anthropic-api-key"
        }
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.app[env.value].secret_id
              version = "latest"
            }
          }
        }
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [template[0].containers[0].image, client, client_version]
  }

  depends_on = [google_secret_manager_secret_iam_member.runtime]
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.web.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_domain_mapping" "web" {
  count    = var.map_domain ? 1 : 0
  name     = var.domain
  location = var.region
  metadata {
    namespace = var.project_id
  }
  spec {
    route_name = google_cloud_run_v2_service.web.name
  }
}
