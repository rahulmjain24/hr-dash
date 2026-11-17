FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend-hr/package.json apps/frontend-hr/
COPY apps/frontend-application/package.json apps/frontend-application/
RUN npm ci --workspace=apps/frontend-application
COPY apps/frontend-application apps/frontend-application
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ARG NEXT_AUTH_COOKIE_NAME=access_token
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_AUTH_COOKIE_NAME=$NEXT_AUTH_COOKIE_NAME \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=apps/frontend-application

FROM node:22-alpine
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3002
WORKDIR /app
COPY --from=build /app/apps/frontend-application/.next/standalone ./
COPY --from=build /app/apps/frontend-application/.next/static apps/frontend-application/.next/static
USER node
EXPOSE 3002
CMD ["node", "apps/frontend-application/server.js"]
