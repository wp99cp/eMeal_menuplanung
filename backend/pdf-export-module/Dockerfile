# ===========================
# Build stage: installs a minimal TeX Live
# and the Python packages
# ===========================
FROM python:3.14-slim AS builder

# The frozen release of TeX Live 2025 is used, such that the build is reproducible.
ARG TEXLIVE_REPOSITORY=https://ftp.math.utah.edu/pub/tex/historic/systems/texlive/2025/tlnet-final

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y --no-install-recommends perl wget xz-utils ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install TeX Live without any packages
WORKDIR /tmp/install-tl
COPY docker/texlive.profile ./
RUN wget -q $TEXLIVE_REPOSITORY/install-tl-unx.tar.gz && \
    tar -xzf install-tl-unx.tar.gz --strip-components=1 && \
    perl ./install-tl --profile=texlive.profile --repository=$TEXLIVE_REPOSITORY --no-interaction
ENV PATH="/opt/texlive/bin/x86_64-linux:$PATH"

# Install the LaTeX packages used by the export
RUN tlmgr install \
    latex-bin tools graphics graphics-def graphics-cfg amsmath etoolbox xkeyval epstopdf-pkg \
    babel babel-german hyphen-german \
    lm ec ucs psnfss zapfding \
    geometry hyperref fancyhdr lastpage datetime fmtcount \
    xcolor colortbl caption float sttools \
    pdflscape multirow enumitem ragged2e setspace

# Fail the build if the export would miss a package
COPY docker/smoke_test.tex script/assets/icons/outline_fresh_product.png ./
RUN pdflatex --interaction=nonstopmode -halt-on-error smoke_test.tex && \
    pdflatex --interaction=nonstopmode -halt-on-error smoke_test.tex

# Remove everything that is only needed to install or update TeX Live
RUN rm -rf /opt/texlive/tlpkg /opt/texlive/install-tl* /opt/texlive/texmf-var/web2c/*.log \
      /opt/texlive/texmf-dist/doc /opt/texlive/texmf-dist/source \
      /opt/texlive/texmf-dist/fonts/opentype /opt/texlive/texmf-dist/fonts/afm /opt/texlive/texmf-dist/fonts/source \
      /opt/texlive/texmf-dist/tex/luatex /opt/texlive/texmf-dist/tex/lualatex /opt/texlive/texmf-dist/scripts \
      /opt/texlive/texmf-var/web2c/luatex /opt/texlive/texmf-var/web2c/luahbtex /opt/texlive/texmf-var/luatex-cache \
      /opt/texlive/readme* /opt/texlive/README* /opt/texlive/index.html /opt/texlive/doc.html \
      /opt/texlive/release-texlive.txt /opt/texlive/LICENSE* && \
    find /opt/texlive/bin/x86_64-linux -mindepth 1 \
      ! -name pdftex ! -name pdflatex ! -name kpsewhich -delete && \
    mktexlsr_dirs="/opt/texlive/texmf-dist /opt/texlive/texmf-var" && \
    for dir in $mktexlsr_dirs; do (cd $dir && ls -LAR ./ > ls-R); done

# Install the Python packages into a virtual environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
COPY script/requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt && \
    pip3 uninstall -y pip && \
    find $VIRTUAL_ENV -name '__pycache__' -prune -exec rm -rf {} +

# ===========================
# Runtime image
# ===========================
FROM python:3.14-slim

WORKDIR /usr/src/app

# The export uses german date formats
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y --no-install-recommends locales tzdata && \
    sed -i 's/^# *de_CH.UTF-8 UTF-8/de_CH.UTF-8 UTF-8/' /etc/locale.gen && \
    locale-gen && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/texlive /opt/texlive
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:/opt/texlive/bin/x86_64-linux:$PATH" \
    PYTHONDONTWRITEBYTECODE=1

# ===========================
# Start API Server
# ===========================
COPY ./ ./
CMD exec gunicorn --workers 1 --bind :$PORT --threads 8 --timeout 0 --chdir script app:app
