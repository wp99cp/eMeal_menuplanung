# Deployment scripts

Deployment scripts are little scripts that should be executed on deployment of a new version. They execute jobs like
copying the help messages form the dev DB to the prod DB. Deployment scripts are included to the build process
(GitHub-Actions), and will therefore be executed automatically.

### List of active build scripts

```shell
# Copy help-page messages form dev to prod DB
python copy_help_messages_to_production_DB.py
```

The help messages are edited on the tab "Hilfetexte" of the admin dashboard. Since the script overwrites the messages
of the prod DB with the ones of the dev DB on every release, edit them in the dev project.
