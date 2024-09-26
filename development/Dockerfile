FROM node:18-alpine as base
WORKDIR /usr/app/

################################################################################
##
## ENV VARS
##

# Server Config
ENV PORT=8443
ENV LOG_LEVEL=debug
ENV APP_NAME="file-explorer-thumbnailer"
ENV ENVIRONMENT="development"

# RabbitMQ
ENV RABBITMQ_HOST="localhost"
ENV RABBITMQ_RETRY_CONNECTION_TIMEOUT=6000
ENV RABBITMQ_RETRY_CONNECTION_ATTEMPTS=5

# Postgres Connection Info
ENV PG_DATABASE="postgres"
ENV PG_USERNAME="postgres"
ENV PG_PASSWORD="password"
ENV PG_HOST="localhost"
ENV PG_PORT="5432"
ENV PG_HOST="postgres"
ENV PG_RETRY_CONNECTION_TIMEOUT=5000
ENV PG_REQURIE_SSL=false

# AWS S3 Config
ENV AWS_REGION="us-west-1"
ENV AWS_ACCESS_KEY_ID=""
ENV AWS_SECRET_ACCESS_KEY=""

################################################################################






# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install

# Install ffmpeg
#RUN apk add ffmpeg

## NODE MODULES
# Install Dev Node Modules
RUN mkdir -p /var/dev
COPY package.json package-lock.json /var/dev/
RUN cd /var/dev && npm install --development
# Install Prod Node Modules
RUN mkdir -p /var/prod
COPY package.json package-lock.json /var/prod/
RUN cd /var/prod && npm install --production



##
## Development Build
## - copy dev dependencies and source code into final image
##
FROM base AS dev
COPY --from=install /var/dev/node_modules node_modules
COPY ./ /usr/app/

# run the app
EXPOSE 8443/tcp
CMD npm run dev



##
## Production Build
## - copy production dependencies and source code into final image
##
FROM base AS prod

COPY --from=install /var/prod/node_modules node_modules
COPY --from=dev /usr/app/src/ ./src/
COPY --from=dev /usr/app/package.json package.json

# run the app
EXPOSE 8443/tcp
CMD npm run start
