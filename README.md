# WallOfBrokenPromises Frontend

React + Vite is a strong fit for this frontend because the app builds into static files that Nginx can serve cheaply, while still giving the project a clean component model and build-time environment variables.

## Local Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` for local configuration. Vite only exposes variables prefixed with `VITE_`.

## Build

```bash
npm run lint
npm run build
```

The static production bundle is written to `dist/`.

## Static Build Artifact

```bash
docker build -t my-frontend-static:latest .
```

The Dockerfile builds the Vite app and packages only `/usr/share/nginx/html` in a static artifact image. It does not run Nginx or publish ports because production uses the backend project's shared edge Nginx.

## Shared Nginx With The Backend

The sibling `my-backend` project already publishes its Nginx container on host ports `80` and `443`. Production should use that one Nginx as the public edge:

- `/` serves this React frontend
- `/api/` proxies to `backend:3000`

The `nginx.conf` in this repository is the shared-edge server config that should replace or be merged into `my-backend/docker/nginx/default.conf`. The backend Nginx image also needs the frontend `dist/` files copied to `/usr/share/nginx/html`.

## Jenkins In Docker

The included `Jenkinsfile` uses Docker agents for Node steps and then builds the static artifact image. Because Jenkins itself is running inside Docker, the Jenkins container needs access to a Docker daemon.

Common setup options:

- Mount the host Docker socket into Jenkins: `-v /var/run/docker.sock:/var/run/docker.sock`
- Or run a Docker-in-Docker sidecar and point Jenkins at that daemon.

The Jenkins container also needs the Docker CLI installed for the `docker build` stage.
