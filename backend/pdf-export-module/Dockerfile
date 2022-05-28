FROM ubuntu:20.04

WORKDIR /usr/src/app

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get -y install tzdata

# ===========================
# Install texlive / latex
# ===========================
RUN apt-get install -y \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-lang-german

# ===========================
# Install Python and Pip
# ===========================
RUN apt-get install -y python3-pip locales locales-all

# ===========================
# Install Pip Packages
# ===========================
COPY script/requirements.txt ./script/
RUN pip3 install --no-cache-dir -r ./script/requirements.txt

# ===========================
# Cleanup Docker Container
# ===========================
RUN rm -rf /var/lib/apt/lists/*

# ===========================
# Start API Server
# ===========================
COPY ./ ./
WORKDIR /usr/src/app
CMD exec gunicorn --workers 1 --bind :$PORT --threads 8 --timeout 0 --chdir script app:app
