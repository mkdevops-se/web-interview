FROM node:20

# Expose port 3001
EXPOSE 3001

# Create backend directory and install dependencies
WORKDIR /usr/src/app/backend/
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Create frontend directory, install dependencies, and build frontend app
WORKDIR /usr/src/app/frontend/
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Copy backend files
WORKDIR /usr/src/app/backend/
COPY backend/ ./

# Start backend server
CMD ["node", "src/index.js"]
