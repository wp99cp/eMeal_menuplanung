# Getting Started - How to run the Project Locally for Development?

The simplest way to get started is using the
provided [Dev Container](https://code.visualstudio.com/docs/devcontainers/containers). This requires minimal setup and
configuration, as a complete environment is provided in the within a docker container. The dev container automatically
starts the project and all its dependencies.

Just open the project in your favorite IDE (e.g. [VS Code](https://code.visualstudio.com/)) and in dev container mode,
and you are ready to go!

::: tip Manuall Restart After Configuration Changes
By default, the application is served locally. It will rebuild/reload the container automatically if you make changes to
the code paced in the `src` folder. If you modify any configuration files, e.g. `docker-compose.yml`, `package.json`,
etc., normally a restart and rebuild of the container is required.

You can restart the application using:

```bash
docker compose down [--volumes]
docker compose up --build
```

The optional `--volumes` flag will remove all volumes, which is useful if you want to start with a clean database.

:::

::: info Limited Support for IntelliJ

As for now, IntelliJ does not support dev containers fully. However, you can still use IntelliJ to develop the project.
However, you have to follow the steps below to get the project running locally on your machine (i.g. without the help of
a dev container).

State of the IntelliJ support:
https://youtrack.jetbrains.com/issue/IDEA-321768

:::

## Getting Started - A Step-by-Step Guide

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
- Docker Compose
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
git clone https://github.com/cevi/automatic_walk-time_tables
```

Once the project is cloned, change into the project directory and checkout the `version-2/main` branch:

```bash
cd automatic_walk-time_tables
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
