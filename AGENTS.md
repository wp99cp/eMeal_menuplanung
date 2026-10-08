# eMeal Menüplanung

A web application to plan the meals of a camp: recipes, meals, a week view, and a PDF export with a shopping list.
It is developed by Cevi Züri 11 and hosted on https://emeal.zh11.ch. The user interface is German (Swiss spelling,
no "ß"), code and documentation are English.

## Layout

| Path                                | Content                                                                         |
|-------------------------------------|---------------------------------------------------------------------------------|
| `frontend/`                         | Angular 20 application (NgModules, AngularFire compat API, Angular Material)    |
| `backend/firebase-cloud-functions/` | Cloud functions (TypeScript, `firebase-functions/v1`) and the Firestore rules   |
| `backend/pdf-export-module/`        | Flask service that renders a camp to a PDF with LaTeX (python, pylatex)         |
| `dev/`                              | Local development environment: emulator image and seed data                     |
| `deployment_scripts/`               | Scripts executed on a release                                                   |
| `docu/`                             | Documentation, start with `General_Project_Structure.md`                        |

The data lives in Firestore. The collections are `users`, `camps`, `meals` (with `specificMeals`), `recipes` (with
`specificRecipes` and `overwrites`) and `sharedData`. A "specific" document holds the settings of a meal or recipe
inside one camp. Every document has an `access` map from uid to `owner`, `editor`, `collaborator` or `viewer`, which
the rules in `backend/firebase-cloud-functions/firestore.rules` check. The access map can only be changed by the
cloud function `changeAccessData`. The types are in
`frontend/src/app/modules/application-module/interfaces/firestoreDatatypes.ts`.

## Running the application

Everything runs locally against the Firebase emulators, see [docu/Local_Development.md](docu/Local_Development.md).
You never need key files or access to a hosted project, and you must not point local code at `cevizh11` or
`cevizh11-menuplanung`.

```shell
pnpm run dev:start    # build, start in the background, wait until seeded and reachable
pnpm run dev:status   # state of the services
pnpm run dev:logs     # last log lines, a single service: `pnpm run dev:logs emulators`
pnpm run dev:reset    # empty database with fresh seed data
pnpm run dev:stop
```

`npm run` works as well. The first start takes several minutes, later ones about a minute.

- Frontend: http://localhost:4200, emulator UI: http://localhost:4000
- Sign in on http://localhost:4200/login with a button below "Lokale Testkonten", e.g. `leiterin@emeal.test`. It owns
  the camp at http://localhost:4200/app/camps/dev-camp-sommerlager. All fake accounts use the password `emeal-dev`.
- The ports are fixed, so only one checkout can run the environment at a time. Starting it replaces a running one.
- Code changes are picked up without a restart (frontend, cloud functions, PDF export module, Firestore rules).

To inspect or change data without the browser, use the REST API of the emulators. The header
`Authorization: Bearer owner` bypasses the rules:

```shell
curl -H 'Authorization: Bearer owner' \
  http://localhost:8080/v1/projects/demo-emeal/databases/(default)/documents/camps/dev-camp-sommerlager
```

## Checking a change

There is no meaningful automated test suite, so verify a change in the running application.

```shell
docker compose exec frontend sh -c 'npx eslint <changed files> && npx ng build --configuration production'
docker compose exec emulators sh -c 'cd /workspace/backend/firebase-cloud-functions/functions && npm run lint && npx tsc --noEmit'
```

The dependencies are installed by the containers, so run the checks there while the environment is up.
`npm run lint` of the frontend reports errors in existing files, so lint the files you changed.

- Frontend: open the affected page in a browser and check the browser console for errors.
- Cloud functions: their logs are in `pnpm run dev:logs emulators` and in the emulator UI. Inside the emulator the
  static members of `admin.firestore` are undefined, import `FieldValue` etc. from `firebase-admin/firestore`.
- PDF export: trigger an export on the page "Export" of a camp, or directly with
  `curl 'http://localhost:5000/export/camp/dev-camp-sommerlager/user/dev-leader/?--wv&--spl&--meals'`. The PDF is
  written to `backend/pdf-export-module/script/` and uploaded to the storage emulator.
- Firestore rules: test them through the frontend with the fake accounts, they have different rights.

## Conventions

- Branches follow git-flow: features branch off `develop`, releases are pull requests to `master`. A push to
  `master` deploys the frontend to production.
- A release bumps the version in `frontend/package.json` and adds an entry to the changelog, see
  `docu/Version_Controlling_and_Release_Notes_Guidelines.md`.
- Deployments are automated, see `docu/Continuous_Integration_And_General_Tests.md`: changes below
  `backend/firebase-cloud-functions/` and `backend/pdf-export-module/` are deployed by Cloud Build once they reach
  `develop` or `master`. Never run `firebase deploy` or `gcloud` yourself.
- Keep `dev/seed/seed.js` in line with the data model: if you add a field the application relies on, add it to the
  seed data too.
