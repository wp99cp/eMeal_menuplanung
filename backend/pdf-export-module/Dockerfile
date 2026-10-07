FROM ubuntu:26.04

WORKDIR /usr/src/app

ENV DEBIAN_FRONTEND=noninteractive

# ===========================
# Install texlive / latex,
# Python and Pip
# ===========================
RUN apt-get update && \
    apt-get install -y \
    tzdata \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-lang-german \
    python3-pip python3-venv locales locales-all && \
    rm -rf /var/lib/apt/lists/*

# ===========================
# Install Pip Packages
# ===========================
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY script/requirements.txt ./script/
RUN pip3 install --no-cache-dir -r ./script/requirements.txt

# ===========================
# Start API Server
# ===========================
COPY ./ ./
WORKDIR /usr/src/app
CMD exec gunicorn --workers 1 --bind :$PORT --threads 8 --timeout 0 --chdir script app:app
