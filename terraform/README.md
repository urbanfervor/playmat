# Playmat infrastructure (project `sixth-oxygen`)

Everything the app needs on GCP, in Terraform: APIs, Firebase web app, Firestore + rules,
anonymous auth, Secret Manager, Artifact Registry, Cloud Run, Cloud Build trigger, and the
`playmat.vada.games` domain mapping (the long-term domain is playmat.games).

## Apply

```bash
gcloud auth application-default login
cd terraform
terraform init
terraform apply
```

Every variable has a checked-in default; no tfvars file is needed. Override with `-var` if you must.

State lives in the `sixth-oxygen-tfstate` GCS bucket under `playmat/`.

## Manual steps

Do these in order. Terraform cannot do them for you.

0. **State bucket**, once. If you already have local state, the second command moves it.

   ```bash
   gcloud storage buckets create gs://sixth-oxygen-tfstate --location=us-central1 --uniform-bucket-level-access
   gcloud storage buckets update gs://sixth-oxygen-tfstate --versioning
   terraform init -migrate-state
   ```

1. **Put the secret values in Secret Manager.** Terraform creates the empty secrets on the first
   apply; add a version to each afterwards (LiveKit keys from LiveKit Cloud; Anthropic key from
   console.anthropic.com). Nothing secret goes in tfvars, state, or the repo.

   ```bash
   printf '%s' 'API...'      | gcloud secrets versions add playmat-livekit-api-key    --data-file=-
   printf '%s' 'secret...'   | gcloud secrets versions add playmat-livekit-api-secret --data-file=-
   printf '%s' 'sk-ant-...'  | gcloud secrets versions add playmat-anthropic-api-key  --data-file=-
   ```

   Check all three are populated (each should list at least one ENABLED version):

   ```bash
   for s in livekit-api-key livekit-api-secret anthropic-api-key; do
     echo "== $s"; gcloud secrets versions list playmat-$s --filter=state=ENABLED --format='value(name,createTime)'
   done
   ```

2. **Connect the GitHub repo to Cloud Build.** Console → Cloud Build → Triggers (region
   `us-central1`) → Connect repository → GitHub (Cloud Build GitHub App) → `var.github_owner/var.github_repo`.
   Until this is done, apply with `-var create_build_trigger=false` and build by hand (step 6).

3. **Import errors.** `firebase.tf` imports two resources that already exist in the project
   (Firebase project, Identity Platform config). If apply reports one does not exist, delete that
   `import` block and re-apply. Playmat uses its own Firestore database named `playmat` so its
   rules never touch the `(default)` database other apps in this project use. If apply reports a different
   resource already exists (for example the Cloud Run service from an earlier manual deploy), import it:

   ```bash
   terraform import google_cloud_run_v2_service.web projects/sixth-oxygen/locations/us-central1/services/playmat-web
   ```

4. **Verify domain ownership for the domain.** Cloud Run domain mapping requires the deploying
   account to be a verified owner in Google Search Console: https://search.google.com/search-console
   → add property `vada.games` (or whatever `var.domain` is under) → DNS TXT verification. Until this is done, apply with
   `-var map_domain=false`.

5. **DNS records.** After apply, `terraform output domain_dns_records` lists the records (a CNAME for a subdomain, A/AAAA for an apex).
   Create them at the registrar. TLS is provisioned automatically once they resolve (up to an hour).

6. **Deploy.** The Cloud Run service starts with a placeholder image. With the trigger in place,
   pushes to `main` deploy. Without it, build from the repo root in Cloud Shell:

   ```bash
   gcloud builds submit --region=us-central1 --config=cloudbuild.yaml \
     --service-account=projects/sixth-oxygen/serviceAccounts/playmat-build@sixth-oxygen.iam.gserviceaccount.com \
     --substitutions=SHORT_SHA=$(git rev-parse --short HEAD),_IMAGE=us-central1-docker.pkg.dev/sixth-oxygen/playmat/web,_SERVICE=playmat-web,_REGION=us-central1,_NEXT_PUBLIC_FIREBASE_API_KEY=$(cd terraform && terraform output -raw firebase_api_key),_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sixth-oxygen.firebaseapp.com,_NEXT_PUBLIC_FIREBASE_PROJECT_ID=sixth-oxygen,_NEXT_PUBLIC_FIREBASE_APP_ID=$(cd terraform && terraform output -raw firebase_app_id),_NEXT_PUBLIC_LIVEKIT_URL=wss://urbanfervor-l3ajxdoo.livekit.cloud
   ```

   Cloud Build owns the image either way; Terraform ignores image changes.

7. **Local dev env.** Public config from Terraform, secrets from Secret Manager:

   ```bash
   terraform output -raw env_local > ../.env.local
   for s in livekit-api-key livekit-api-secret anthropic-api-key; do
     echo "$(echo $s | tr a-z- A-Z_)=$(gcloud secrets versions access latest --secret=playmat-$s)" >> ../.env.local
   done
   ```

8. **Rotate a secret**: add a new version with `gcloud secrets versions add` as in step 1. Cloud
   Run picks up `latest` on the next deploy, no Terraform run needed.

## Notes

- `NEXT_PUBLIC_*` values are baked into the client bundle at build time, so they are passed as
  Docker build args by the trigger, not as Cloud Run env vars. Server-only secrets are mounted from
  Secret Manager at runtime.
- Firestore rules deploy from `../firestore.rules` on every apply; edit the file and re-apply.
