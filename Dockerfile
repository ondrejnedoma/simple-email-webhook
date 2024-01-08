# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy the rest of the source code
COPY . .

# Install dependencies
RUN npm install

# Specify the start command
CMD ["npm", "start"]