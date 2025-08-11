# Use official Node.js image as the base
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy frontend files and install dependencies
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Copy backend files and install dependencies
WORKDIR /app
COPY backend ./backend
COPY backend/package.json ./backend/package.json
COPY backend/package-lock.json ./backend/package-lock.json
RUN cd backend && npm install

# Copy frontend build to backend
RUN cp -r /app/frontend/dist /app/backend/

# Set working directory to backend
WORKDIR /app/backend

# Expose port (change if your backend uses a different port)
EXPOSE 3000

# Start the backend server
CMD ["node", "index.js"]
