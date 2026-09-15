# playmat.games

Webcam tabletop for physical card games. See `PLAN.md`.

## Run locally

```bash
cp .env.example .env.local   # fill in Firebase + LiveKit values
npm install
npm run dev
```

## Deploy

Everything is in Terraform: see `terraform/README.md`. Cloud Build runs `cloudbuild.yaml` on pushes to `main`.
