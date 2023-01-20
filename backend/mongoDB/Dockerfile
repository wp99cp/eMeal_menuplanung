FROM mongo

# Copy Configuration File
COPY ./mongo.conf /etc/mongo/mongo.conf

# Copy entrypoint.sh
COPY entrypoint.sh /entrypoint.sh

# Set entrypoint.sh as entrypoint
ENTRYPOINT ["bash", "entrypoint.sh"]