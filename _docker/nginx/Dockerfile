FROM nginx:alpine as base

RUN apk add --no-cache gettext

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

FROM base as dev

COPY nginx.dev.template /etc/nginx/templates/nginx.conf.template

ENTRYPOINT [ "/entrypoint.sh" ]

FROM base as prod

COPY nginx.prod.template /etc/nginx/templates/nginx.conf.template

ENTRYPOINT [ "/entrypoint.sh" ]
