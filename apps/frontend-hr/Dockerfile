FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend-hr/package.json apps/frontend-hr/
COPY apps/frontend-application/package.json apps/frontend-application/
RUN npm ci --workspace=apps/frontend-hr
COPY apps/frontend-hr apps/frontend-hr
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ARG NEXT_AUTH_COOKIE_NAME=access_token
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_AUTH_COOKIE_NAME=$NEXT_AUTH_COOKIE_NAME \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=apps/frontend-hr

FROM node:22-alpine
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3001
WORKDIR /app
COPY --from=build /app/apps/frontend-hr/.next/standalone ./
COPY --from=build /app/apps/frontend-hr/.next/static apps/frontend-hr/.next/static
COPY --from=build /app/apps/frontend-hr/public apps/frontend-hr/public
USER node
EXPOSE 3001
CMD ["node", "apps/frontend-hr/server.js"]
