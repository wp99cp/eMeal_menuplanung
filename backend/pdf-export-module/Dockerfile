FROM debian:latest

WORKDIR /usr/src/app

# install latex and python packages
RUN apt-get update && \
    apt-get install -y texlive-fonts-recommended texlive-latex-extra && \
    apt-get install -y python3-pip && \
    apt-get install -y locales locales-all

# install required latex packages -> see https://packages.debian.org/jessie/texlive-latex-recommended
RUN apt-get install texlive-lang-german && \
    apt-get install texlive-latex-recommended

# install python packages
COPY script/requirements.txt ./script/
RUN pip3 install --no-cache-dir -r ./script/requirements.txt

# run python script
COPY ./ ./
WORKDIR "/script"
CMD exec gunicorn --workers 1 --bind :$PORT --threads 8 --timeout 0  app:app