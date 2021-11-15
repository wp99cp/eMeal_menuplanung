# Docker Container for Exporting a Camp

This Docker container contains the functionality for the PDF export of a camp.

![Export Overview](docu/export_overview.png)

This docker container hosts a simple flask server that exposes an API-endpoint to create PDF exports for a specific
camp. The endpoint accepts various export settings as HTTP queries directly in the URL. Each request to the
corresponding URL will trigger the creation of a PDF export. Once the PDF is created, the container will upload it to a
firebase-storage bucket. Furthermore, a new document is made in the Firestore database containing the export meta-data
and a link to the created PDF. This link will be used by the frontend to display a download link.

## Setup

Before running the container, you must add your own keys files to the folder `./keys/`. Both key for
the `Firebase Admin SDK` (inside a subfolder called ```firebase```) and for the `Influxdb`. Latter should be a file of
the following structure called `./keys/influx/influx_settings.json`.

```json
{
  "host": ...,
  "port": ...,
  "username": ...,
  "password": ...,
  "database": ...
}
```

## Build and Run

We expect docker is already pre-installed. Within a linux environment you can run the following command to build and
execute the export function inside a container environment.

```shell
docker build . -t exportcamp && docker run -e PORT=5000 -p 5000:5000 exportcamp
```

Now the webserver should run, and you can trigger a PDF creation by navigating to

```
http://localhost:5000/export/camp/<campID>/user/<userID>/?<optional_args>
```

For example
```http://localhost:5000/export/camp/16fXu6siwVDX1OOb38P3/user/CKsbjuHkJQUstW1YULeAepDe9Wl1/?--spl&--lscp&--wv```
will create an export for camp ```16fXu6siwVDX1OOb38P3``` including the shopping list and the weekview in landscape.

More export flags can be found [hier](./script/README.md).

### Run the export function outside a container environment

We expect you to have python and texlive installed on your system. Furthermore, you must install all the dependencies
listed in `requirements.txt`. Now, you can run the export function using the following command. Replace `{{user_id}}`
and `{{ucamp_id}}` with the corresponding document ids. A full list of the optional arguments can be found
in [this collection](script/README.md).

```shell
python pdf_generator.py {{user_id}} {{camp_id}} --optionalArgs
```

For example:

```shell
python pdf_generator.py CKsbjuHkJQUstW1YULeAepDe9Wl1 16fXu6siwVDX1OOb38P3 --dfn --lscp --mp
```

## Testing

Exporting the camp at the end of its creation process is one of the application's core features. Therefore, extensive
testing is desired and necessary. See [test strategy](tests/README.md) for details. The tests can be run outside a
container environment with the following command:

```shell
python tests/test.py
```