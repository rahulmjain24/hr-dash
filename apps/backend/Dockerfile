FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend-hr/package.json apps/frontend-hr/
COPY apps/frontend-application/package.json apps/frontend-application/

FROM base AS build
RUN npm ci --workspace=apps/backend
COPY apps/backend apps/backend
RUN npm run build --workspace=apps/backend

FROM base
ENV NODE_ENV=production
RUN npm ci --workspace=apps/backend --omit=dev && npm cache clean --force
COPY --from=build /app/apps/backend/dist apps/backend/dist
WORKDIR /app/apps/backend
USER node
EXPOSE 3000

CMD ["node", "dist/src/main.js"]
