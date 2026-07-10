FROM amazon/aws-cli:latest

RUN mkdir -p /app

COPY sync.sh /app/sync.sh

RUN chmod +x /app/sync.sh

ENTRYPOINT ["/app/sync.sh"]