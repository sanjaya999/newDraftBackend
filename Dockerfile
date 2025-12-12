# --- STAGE 1: BUILD ENVIRONMENT ---
# Use a specific, full Node image for building
FROM node:22.18.0-bullseye AS builder

WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Install dependencies (including devDependencies needed for build)
RUN npm install

# Copy source code
COPY . .

# Run build command and Prisma generation
RUN npm run build \
    && npx prisma generate

# --- STAGE 2: PRODUCTION RUNTIME ---
# Use a slim, secure image for the final runtime environment
# This is much smaller and more secure.
FROM node:22.18.0-slim AS final

WORKDIR /usr/src/app

# Only install PM2 globally in the final runtime image
RUN npm install -g pm2

# Copy ONLY necessary files from the builder stage:
# 1. The node_modules (which were already installed)
COPY --from=builder /usr/src/app/node_modules ./node_modules
# 2. The package.json (needed for PM2/npm start commands)
COPY --from=builder /usr/src/app/package*.json ./
# 3. The built source code (usually a 'dist' or 'build' folder)
# **CRITICAL**: Adjust 'dist' if your build output goes elsewhere!
COPY --from=builder /usr/src/app/dist ./dist 
# 4. Copy the PM2 config file and Prisma schema/binary
COPY --from=builder /usr/src/app/ecosystem.config.js .
COPY --from=builder /usr/src/app/prisma ./prisma

# Expose port (8080 is correctly exposed)
EXPOSE 8080

# Start the application with PM2 and run migrations first
# Note: You need to install the 'prisma' CLI globally or locally 
# for 'npx prisma' to work correctly in this final stage. 
CMD ["sh", "-c", "npx prisma migrate deploy && pm2-runtime ecosystem.config.js"]