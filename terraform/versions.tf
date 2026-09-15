terraform {
  required_version = ">= 1.7"

  # Bucket is created by hand once (README step 0), then `terraform init -migrate-state`.
  backend "gcs" {
    bucket = "sixth-oxygen-tfstate"
    prefix = "playmat"
  }
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project               = var.project_id
  region                = var.region
  user_project_override = true
}

provider "google-beta" {
  project               = var.project_id
  region                = var.region
  user_project_override = true
}
