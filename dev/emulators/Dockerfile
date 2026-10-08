# Firebase emulator suite (auth, firestore, functions, storage) for local development.
# See /docu/Local_Development.md
FROM node:22-bookworm-slim

# the emulators are java applications
COPY --from=eclipse-temurin:21-jre /opt/java/openjdk /opt/java/openjdk
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH="${JAVA_HOME}/bin:${PATH}"

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# should match the version in backend/firebase-cloud-functions/functions/package.json
ARG FIREBASE_TOOLS_VERSION=15.32.1
RUN npm install -g firebase-tools@${FIREBASE_TOOLS_VERSION}

# The container runs with the uid of the host user, such that files created in the
# mounted repository belong to that user. Hence the home directory is writable for everyone.
ENV HOME=/opt/home
RUN mkdir -p ${HOME} && \
    firebase setup:emulators:firestore && \
    firebase setup:emulators:storage && \
    firebase setup:emulators:ui && \
    chmod -R a+rwX ${HOME}

COPY entrypoint.sh /usr/local/bin/emulators-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/emulators-entrypoint.sh"]
