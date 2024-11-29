#!/bin/sh
# Create the .env file from environment variables
printenv > /app/.env
npm run build
# Start the application
exec "$@"