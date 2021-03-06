# Based on https://github.com/angular-fullstack/angular-fullstack-dockerfile
FROM node:8

# Global dependencies
RUN npm install -g clean-css-cli html-minifier

# Make src directory
RUN mkdir -p /usr/src/se-reporting-engine
WORKDIR /usr/src/se-reporting-engine

ENV NODE_PATH=/usr/local/lib/node_modules/:/usr/local/lib

# Install stat-engine dependencies
COPY package.json /usr/src/se-reporting-engine/
RUN npm install

# Copy rest of src over
COPY . /usr/src/se-reporting-engine

# Compile
RUN npm run compile

ENV NODE_ENV=production

CMD [ "node", "/usr/src/se-reporting-engine/lib/index.js" ]