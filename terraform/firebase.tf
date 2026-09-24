# The project is already a Firebase project (other apps in this repo use it),
# so the project and auth config are imported rather than created. Remove an
# import block if apply says that resource does not exist yet.

import {
  to = google_firebase_project.default
  id = "projects/${var.project_id}"
}

resource "google_firebase_project" "default" {
  provider   = google-beta
  depends_on = [google_project_service.required]
}

resource "google_firebase_web_app" "playmat" {
  provider     = google-beta
  display_name = "Playmat"
  depends_on   = [google_firebase_project.default]
}

data "google_firebase_web_app_config" "playmat" {
  provider   = google-beta
  web_app_id = google_firebase_web_app.playmat.app_id
}

# The first apply imported the shared (default) database; forget it from state
# without destroying it. Other apps in this project own its rules.
removed {
  from = google_firestore_database.default
  lifecycle {
    destroy = false
  }
}

# Playmat gets its own database so its rules release cannot clobber the
# (default) database's rules.
resource "google_firestore_database" "playmat" {
  name        = "playmat"
  location_id = "nam5"
  type        = "FIRESTORE_NATIVE"
  depends_on  = [google_project_service.required]
}

# Want-to-play registrations delete themselves once their window ends.
resource "google_firestore_field" "wants_ttl" {
  database   = google_firestore_database.playmat.name
  collection = "wants"
  field      = "endsAt"
  ttl_config {}
}

# The home feed lists public tables only (firestore.rules refuses anything else).
resource "google_firestore_index" "rooms_public_by_created" {
  database   = google_firestore_database.playmat.name
  collection = "rooms"
  fields {
    field_path = "private"
    order      = "ASCENDING"
  }
  fields {
    field_path = "createdAt"
    order      = "DESCENDING"
  }
}

resource "google_firestore_index" "rooms_public_by_scheduled" {
  database   = google_firestore_database.playmat.name
  collection = "rooms"
  fields {
    field_path = "private"
    order      = "ASCENDING"
  }
  fields {
    field_path = "scheduledAt"
    order      = "ASCENDING"
  }
}

resource "google_firebaserules_ruleset" "firestore" {
  provider = google-beta
  source {
    files {
      name    = "firestore.rules"
      content = file("${path.module}/../firestore.rules")
    }
  }
  depends_on = [google_firestore_database.playmat]
}

resource "google_firebaserules_release" "firestore" {
  provider     = google-beta
  name         = "cloud.firestore/${google_firestore_database.playmat.name}"
  ruleset_name = "projects/${var.project_id}/rulesets/${google_firebaserules_ruleset.firestore.name}"
  lifecycle {
    replace_triggered_by = [google_firebaserules_ruleset.firestore]
  }
}

import {
  to = google_identity_platform_config.default
  id = var.project_id
}

resource "google_identity_platform_config" "default" {
  sign_in {
    anonymous {
      enabled = true
    }
  }
  authorized_domains = [
    "localhost",
    "${var.project_id}.firebaseapp.com",
    "${var.project_id}.web.app",
    var.domain,
    trimprefix(google_cloud_run_v2_service.web.uri, "https://"),
  ]
  # The API reports these blocks even when unset; ignore them so plans stay quiet.
  lifecycle {
    ignore_changes = [multi_tenant, sign_in[0].email, sign_in[0].phone_number]
  }
  depends_on = [google_project_service.required]
}
