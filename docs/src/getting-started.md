# Getting Started

How to run the project locally for development?

::: tip An Easy Start

One of our biggest goals is to make it as easy as possible to get started with the project. If you face any issues,
please let us know by opening an issue on [GitHub](https://github.com/wp99cp/emeal_menuplanung).

:::

## Using Dev Containers

The simplest way to get started is using the
provided [Dev Container](https://code.visualstudio.com/docs/devcontainers/containers). This requires minimal setup and
configuration, as a complete environment is provided in the within a docker container. The dev container automatically
starts the project and all its dependencies.

Just open the project in your favorite IDE (e.g. [VS Code](https://code.visualstudio.com/)) and in dev container mode,
and you are ready to go!

::: details Limited Support for Jetbrains IDEAs

As for now, IntelliJ does not support dev containers fully. However, you can still use IntelliJ to develop the project.
However, you have to follow the steps below to get the project running locally on your machine (i.g. without the help of
a dev container).

State of the IntelliJ support:
https://youtrack.jetbrains.com/issue/IDEA-321768

:::

### Manuall Restart After Configuration Changes

By default, the application is served locally. It will rebuild/reload the container automatically if you make changes to
the code paced in the `src` folder. If you modify any configuration files, e.g. `docker-compose.yml`, `package.json`,
etc., normally a restart and rebuild of the container is required.

You can restart the application using:

```bash
docker compose down [--volumes]
docker compose up --build
```

The optional `--volumes` flag will remove all volumes, which is useful if you want to start with a clean database.

::: warning Compose Watch
Using the new [Use Compose Watch command](https://docs.docker.com/compose/file-watch/) feature, you can automatically
restart the application if you make changes to the configuration files.

For now, we have not yet configured this feature. Refer to the corresponding issue [_Use Docker Compose Watch
#222_](https://github.com/wp99cp/eMeal_menuplanung/issues/222) to track the progress.
:::

## Using Docker

This guide will walk you through the steps to get the project running locally on your machine (i.g. without the help of
a dev container). However, we will still use docker to start the project. If you want to use a different
setup, you can skip this guide and use the provided docker-compose file as a reference.

::: info
We assume that you are using a Linux system. If you are using a different operating system, you might need to adapt the
commands to your system.
:::

### Prerequisites

Make sure you have the following tools installed on your system:

- Docker
- Git
- Node and NPM

::: info Why do I need to install node and npm?

Why do I need to install node and npm, if the project is running in a docker container?

If you only want to run the project locally, you can skip steps (2) and (3) blow and directly
run `docker compose up --build` to launch the application. However, if you wish to have full IDE support,
you need to install node and npm locally. This is because the IDE needs to be able to resolve the dependencies and
provide code completion. If you do not install node and npm locally, you will get errors.

:::

### Step 1: Clone the Project

Clone the project from GitHub:

```bash
git clone https://github.com/wp99cp/emeal_menuplanung
```

Once the project is cloned, change into the project directory and checkout the `version-2/main` branch:

```bash
cd emeal_menuplanung
git checkout version-2/main
```

### Step 2: Install Dependencies

Install the dependencies for the frontend and backend:

```bash
npm install
```

### Step 3: Start the Project & Enjoy Building!

Start the project by running the following:

```bash
npm start
```

This will start the project and all its dependencies (using docker). The first time you start the project, it will take
a while to download all the required images. Once the project is started, you can access the frontend at
[http://localhost:4000](http://localhost:4000).
