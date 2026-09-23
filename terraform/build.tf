resource "google_service_account" "build" {
  account_id   = "playmat-build"
  display_name = "Playmat Cloud Build"
}

# The project is shared with other services, so the build account gets deploy
# rights on the playmat service and image repo only, not project-wide.
resource "google_project_iam_member" "build" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.build.email}"
}

moved {
  from = google_project_iam_member.build["roles/logging.logWriter"]
  to   = google_project_iam_member.build
}

resource "google_cloud_run_v2_service_iam_member" "build_deploys" {
  name     = google_cloud_run_v2_service.web.name
  location = var.region
  role     = "roles/run.developer"
  member   = "serviceAccount:${google_service_account.build.email}"
}

resource "google_artifact_registry_repository_iam_member" "build_pushes" {
  repository = google_artifact_registry_repository.playmat.name
  location   = var.region
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.build.email}"
}

# Deploying a revision that runs as the runtime SA requires actAs on it.
resource "google_service_account_iam_member" "build_acts_as_runtime" {
  service_account_id = google_service_account.runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.build.email}"
}

resource "google_cloudbuild_trigger" "main" {
  count           = var.create_build_trigger ? 1 : 0
  name            = "playmat-main"
  location        = var.region
  service_account = google_service_account.build.id
  filename        = "cloudbuild.yaml"

  github {
    owner = var.github_owner
    name  = var.github_repo
    push {
      branch = "^main$"
    }
  }

  substitutions = {
    _IMAGE                            = local.image
    _SERVICE                          = var.service_name
    _REGION                           = var.region
    _NEXT_PUBLIC_FIREBASE_API_KEY     = data.google_firebase_web_app_config.playmat.api_key
    _NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = data.google_firebase_web_app_config.playmat.auth_domain
    _NEXT_PUBLIC_FIREBASE_PROJECT_ID  = var.project_id
    _NEXT_PUBLIC_FIREBASE_APP_ID      = google_firebase_web_app.playmat.app_id
    _NEXT_PUBLIC_LIVEKIT_URL          = var.livekit_url
    _SITE_URL                         = "https://${var.domain}"
  }

  depends_on = [google_project_iam_member.build, google_cloud_run_v2_service_iam_member.build_deploys, google_artifact_registry_repository_iam_member.build_pushes, google_service_account_iam_member.build_acts_as_runtime]
}
