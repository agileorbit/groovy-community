FROM library/ruby:2.1-alpine

RUN "apk update" && \
  "apk add build-base"
WORKDIR /site
CMD "/site/build.sh"
VOLUME /site
