# playmat.games

Webcam tabletop for physical card games.

## Run locally

```bash
cp .env.example .env.local   # fill in Firebase + LiveKit values
npm install
gcloud auth application-default login   # API routes read Firestore and verify sign-ins with firebase-admin
npm run dev
```

## Deploy

Everything is in Terraform: see `terraform/README.md`. Cloud Build runs `cloudbuild.yaml` on pushes to `main`.
