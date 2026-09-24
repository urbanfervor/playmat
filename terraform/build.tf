resource "google_service_account" "build" {
  account_id   = "playmat-build"
  display_name = "Playmat Cloud Build"
}

# Every build runs `terraform apply` before deploying (cloudbuild.yaml), so
# the build SA needs to manage everything in this folder: editor for the
# resources, plus the admin roles editor lacks for IAM bindings and secrets.
resource "google_project_iam_member" "build" {
  for_each = toset([
    "roles/run.admin",
    "roles/artifactregistry.writer",
    "roles/logging.logWriter",
    "roles/editor",
    "roles/resourcemanager.projectIamAdmin",
    "roles/iam.serviceAccountAdmin",
    "roles/secretmanager.admin",
  ])
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.build.email}"
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

  depends_on = [google_project_iam_member.build, google_service_account_iam_member.build_acts_as_runtime]
}
