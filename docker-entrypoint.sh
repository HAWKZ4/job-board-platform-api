#!/bin/sh
set -e

echo "Running database migrations..."
node ./node_modules/typeorm/cli.js migration:run -d ./dist/typeorm.config.js

echo "Starting NestJS app..."
exec node dist/src/main.js
