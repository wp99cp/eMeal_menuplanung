FROM mongo

# Copy Configuration File
COPY ./mongo.conf /etc/mongo/mongo.conf

# Copy entrypoint.sh
COPY entrypoint.sh /entrypoint.sh

# Install netcat
RUN apt-get update && apt-get install -y netcat && rm -rf /var/lib/apt/lists/*

# Set entrypoint.sh as entrypoint
ENTRYPOINT ["bash", "entrypoint.sh"]