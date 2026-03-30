# Projet web 2026

## Folders

- `.husky` - git hooks
- `.vscode` - editor configs
- `apps` - application code
  - `client` - react frontend
  - `api` - express backend

## Installation

Install [pnpm](https://pnpm.io/) and Docker

### Dependencies

```sh
pnpm i
```

### Environment variables

```sh
cp .env.example .env
cp ./apps/api/.env.example ./apps/api/.env
```

## Development

Start the database with docker:

```sh
pnpm docker
```

Start the api and client in parallel:

```sh
pnpm dev
```

## Build

```sh
pnpm build
```
