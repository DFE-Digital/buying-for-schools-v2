FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install --production --no-optional

# Bundle app source
COPY app/ ./app
COPY sass/ ./sass
COPY gulpfile.js ./gulpfile.js

RUN npm run build

EXPOSE 8080
EXPOSE 8000
CMD [ "node", "app/index.js" ]