FROM node:18-alpine as base
WORKDIR /usr/app/

################################################################################
##
## ENV VARS
##

# Server Config
ENV PORT=8441
ENV LOG_LEVEL=debug
ENV APP_NAME="file-explorer-thumbnailer"
ENV ENVIRONMENT="development"

# RabbitMQ
ENV RABBITMQ_HOST="NO_RABBITMQ_HOST_DEFINED"
ENV RABBITMQ_RETRY_CONNECTION_TIMEOUT=6000
ENV RABBITMQ_RETRY_CONNECTION_ATTEMPTS=5

# AWS S3 Config
ENV AWS_REGION="us-west-1"
ENV AWS_ACCESS_KEY_ID="NO_AWS_ACCESS_KEY_ID_DEFINED"
ENV AWS_SECRET_ACCESS_KEY="NO_AWS_SECRET_ACCESS_KEY_DEFINED"

# Redis Config
ENV REDIS_HOST="NO_REDIS_HOST_DEFINED"
ENV REDIS_PORT="6379"
ENV REDIS_PASSWORD=""
ENV REDIS_TTL=24000
ENV REDIS_CONNECTION_RETRY_DELAY=6000
ENV REDIS_RETRY_CONNECTION_ATTEMPTS=5 

################################################################################

# make file upload/download directory
RUN mkdir -p /usr/file

# Install ffmpeg
RUN apk update
RUN apk upgrade
RUN apk add --no-cache ffmpeg








# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install


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
EXPOSE 8441/tcp
CMD npm run dev



##
## Production Build
## - copy production dependencies and source code into final image
##
FROM base AS prod

COPY --from=install /var/prod/node_modules node_modules
COPY ./src /usr/app/src/
COPY ./package.json package.json

# run the app
EXPOSE 8441/tcp
CMD npm start
