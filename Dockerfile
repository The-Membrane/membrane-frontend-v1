FROM node:18-alpine
WORKDIR ./pages
COPY . .
RUN yarn install --production
CMD ["node", "/index.tsx"]
EXPOSE 3000