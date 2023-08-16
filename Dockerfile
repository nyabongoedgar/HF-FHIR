# Use the specified node image
FROM node:16.17.0-bullseye-slim

# Set the working directory in the container
WORKDIR /app

# Copy the package.json first for better caching
COPY package.json .

# Install app dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Indicate that the container listens on the specified network port at runtime
EXPOSE 3058

# Command to run the application
CMD ["node", "src/index.js"]
