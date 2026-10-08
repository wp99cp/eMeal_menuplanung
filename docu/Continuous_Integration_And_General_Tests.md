
# Continuous Integration and General Tests
This is a description of the tests and actions that are performed automatically. 
 
## Actions on a Pull Request to Master
 
### Version Checking
_(Test name: check-version-number)_

Checks if the version number has been increased since the last commit to the master branch. Checks if 
the version number of the different components are identical. Adds a corresponding label to the pull request.


## Deployments

| Component | Branch `develop` | Branch `master` | Defined in |
|---|---|---|---|
| Frontend | - | Firebase Hosting of `cevizh11-menuplanung` (emeal.zh11.ch) | `.github/workflows/create-release.yml` |
| Cloud functions | project `cevizh11` | project `cevizh11-menuplanung` | `backend/firebase-cloud-functions/cloudbuild.yaml` |
| PDF export service | Cloud Run service `emeal-pdf-export-develop` | Cloud Run service `prod-emeal-menuplanung-pdf-export-service` | `backend/pdf-export-module/cloudbuild.yaml` |

The frontend is deployed by GitHub Actions. A pull request to `master` additionally creates preview channels for
both firebase projects.

The cloud functions and the PDF export service are deployed by Cloud Build triggers of the corresponding Google Cloud
project. A trigger only runs if files of its component have changed (`backend/firebase-cloud-functions/**` or
`backend/pdf-export-module/**`). The trigger of the PDF export service in the project `cevizh11` also runs for
branches called `release/*`. The result of a build is reported as a check on the commit.

### Cloud functions

The functions use the service account of the cloud functions, no key files are needed. The OAuth settings for
db.cevi.ch are stored in the Secret Manager of each project as secret `CEVI_DB_OAUTH`, a JSON with the fields
`client_id`, `client_secret`, `redirect_uri`, `token_url` and `profile_url`.

Only the functions are deployed. The Firestore rules in `backend/firebase-cloud-functions/firestore.rules` are not
deployed automatically.

### PDF export service

Every build creates a new revision of the Cloud Run service and routes all traffic to it. Older revisions are kept.
To roll back, route the traffic to an older revision:

```shell
gcloud run revisions list --service <service> --region europe-west6 --project <project>
gcloud run services update-traffic <service> --region europe-west6 --project <project> --to-revisions <revision>=100
```

The traffic stays on that revision until the next build routes it to the latest revision again.
