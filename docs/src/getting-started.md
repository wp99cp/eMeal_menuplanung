# Getting Started - How to run the Project Locally for Development?

The simplest way to get started is using the provided docker-compose file. It will start a local instance of the project
with a database, backend, frontend and these docs.

You can start the project by running the following command in the root directory of the project:

```bash
docker-compose up [--build]
```

::: info
`--build` is optional and forces docker to rebuild the containers.

By default, the application is served locally. It will rebuild/reload the container automatically if you make changes to
the code paced in the `src` folder. If you modify any configuration files, e.g. `docker-compose.yml`, `package.json`,
etc., normally a restart and rebuild of the container is required.
:::

::: danger
The provided `docker-compose.yml` file is only intended for development purposes.

**It is not intended for production use!**
:::

## Getting Started - A Step-by-Step Guide

This guide will walk you through the steps to get the project running locally on your machine. It will use the provided
docker-compose file to start the project. If you want to use a different setup, you can skip this guide and use the
provided docker-compose file as a reference.

::: info
We assume that you are using a Linux system. If you are using a different operating system, you might need to adapt the
commands to your system.
:::

### Prerequisites

Make sure you have the following tools installed on your system:

- Docker
- Docker Compose
- Git

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

### Step 2: Start the Project

Start the project by running the following command in the root directory of the project:

```bash
docker-compose up [--build]
```

This will start the project and all its dependencies. The first time you start the project, it will take a while to
download all the required images. Once the project is started, you can access the frontend at
[http://localhost:4000](http://localhost:4000).