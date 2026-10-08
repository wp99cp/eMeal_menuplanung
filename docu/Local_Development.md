# Local Development

The whole application runs on your machine: the frontend, the PDF export module and the
[Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite) (auth, Firestore, storage and the
cloud functions). The emulators use the project `demo-emeal`, which only exists locally. Nothing talks to the hosted
projects `cevizh11` or `cevizh11-menuplanung`, and no key files are needed.

## Requirements

Docker with the compose plugin, and pnpm or npm to run the commands below. Everything else (Node, Java, Python,
LaTeX) lives inside the containers.

## Commands

Run them in the root of the repository, with `pnpm run` or `npm run`.

| Command               | Description                                                                               |
|-----------------------|-------------------------------------------------------------------------------------------|
| `pnpm run dev`        | Builds and starts everything in the foreground, logs of all services in one terminal.     |
| `pnpm run dev:start`  | Same, but in the background. Returns once the application is seeded and reachable.        |
| `pnpm run dev:stop`   | Stops everything. The data of the emulators is lost.                                      |
| `pnpm run dev:status` | Lists the services and their state.                                                       |
| `pnpm run dev:logs`   | Prints the last log lines. A single service: `pnpm run dev:logs pdf-export`.              |
| `pnpm run dev:seed`   | Writes the fake accounts and the example data again. Other documents stay untouched.      |
| `pnpm run dev:reset`  | Restarts the emulators with an empty database and seeds them again.                       |

The commands call [`/dev/compose.sh`](/dev/compose.sh), a wrapper around `docker compose` that passes the uid of the
host user and the current git branch to the containers.

The first start takes several minutes: it builds the images (the PDF export module contains a LaTeX distribution)
and installs the npm dependencies into `frontend/node_modules` and
`backend/firebase-cloud-functions/functions/node_modules`. Later starts take about a minute.

## Services

| URL                   | Service                                                                           |
|-----------------------|-----------------------------------------------------------------------------------|
| http://localhost:4200 | Frontend (`ng serve` with the configuration `emulator`)                           |
| http://localhost:4000 | Emulator UI: browse and edit accounts, documents, files and the logs of functions |
| http://localhost:5000 | PDF export module                                                                 |
| http://localhost:5001 | Cloud functions                                                                   |
| http://localhost:8080 | Firestore                                                                         |
| http://localhost:9099 | Auth                                                                              |
| http://localhost:9199 | Storage                                                                           |

All ports are bound to `127.0.0.1` only. They are fixed, hence only one instance can run at a time: starting the
environment in a second checkout replaces the running one.

Changes to the code are picked up without a restart:

- **Frontend**: `ng serve` rebuilds and reloads the page.
- **Cloud functions**: `tsc --watch` recompiles, the emulator loads the new code on the next call.
- **PDF export module**: gunicorn reloads the changed python files.
- **Firestore rules**: the emulator reloads `firestore.rules` once the file changes.

After changing a `Dockerfile` or the python `requirements.txt`, run `pnpm run dev:start` again. After changing a
`package-lock.json`, restart the service (`docker compose restart frontend` or `emulators`).

## Fake Accounts

The sign-in page lists the fake accounts under "Lokale Testkonten", one click signs you in. They can also be used
in the regular form. The password of all accounts is `emeal-dev`.

| E-Mail                | UID          | Description                                                             |
|-----------------------|--------------|-------------------------------------------------------------------------|
| `leiterin@emeal.test` | `dev-leader` | Lea Lagerleiterin, owner of the example camp, its meals and recipes     |
| `koch@emeal.test`     | `dev-cook`   | Kim Koch, editor of the example camp                                    |
| `neu@emeal.test`      | `dev-new`    | Noah Neu, no data, sees the changelog on the first sign in              |
| `admin@emeal.test`    | `dev-admin`  | Alex Admin, has the custom claim `isAdmin`, owner of the meal templates |

"Anmelden mit Google" opens the fake account chooser of the auth emulator, where you can create further accounts.
New accounts can also be added in the emulator UI.

The accounts and the example data are defined in [`/dev/seed/seed.js`](/dev/seed/seed.js): the camp
"Sommerlager 2027" (id `dev-camp-sommerlager`) with three meals, a meal template visible for all users, the unit
conversions and food categories used for the shopping list, and two help messages. The list of accounts on the sign-in
page comes from `frontend/src/environments/environment.emulator.ts`.

## How it is wired

- [`/docker-compose.yml`](/docker-compose.yml) defines the services `emulators`, `seed`, `pdf-export` and `frontend`.
  The repository is mounted into the containers, which run with the uid of the host user.
- [`/backend/firebase-cloud-functions/firebase.emulator.json`](/backend/firebase-cloud-functions/firebase.emulator.json)
  configures the emulators. It is separate from `firebase.json`, which is used for deployments. The storage rules in
  `storage.emulator.rules` are for the emulator only.
- The **frontend** connects to the emulators if `environment.useEmulators` is set
  (`frontend/src/app/shared/emulator-providers.ts`). Its `build.ts` is written by `/dev/frontend/write-build-info.js`,
  as there is no git repository inside the container.
- The **cloud functions** need no changes, the emulator sets the project and the addresses of the other emulators.
  One restriction applies: inside the functions emulator the static members of `admin.firestore` (`FieldValue`,
  `Timestamp`, `v1`) are undefined. Import them from `firebase-admin/firestore` instead.
- The **PDF export module** connects to the emulators if `FIRESTORE_EMULATOR_HOST` is set
  (`script/utils/firebase_clients.py`).

## What is not available locally

- **Sign in with Cevi.DB**: it needs the secret `CEVI_DB_OAUTH` with the OAuth client of db.cevi.ch and a redirect
  to emeal.zh11.ch.
- **Scheduled functions** (backup, weekly report, clean up of old exports): there is no Pub/Sub emulator configured.
- **Importing a meal from a webpage** works, but fetches the real webpage and therefore needs internet access.
