#!/bin/sh

# setup initial config file
if ! { [ -f /data/config.json ] || [ -f /data/config.default.json ]; }; then
    echo "No config.json or config.default.json file found at /data. Please make sure you mounted a data store volume to /data and have a config.json file in it."
    exit
fi

echo "Running dockerized"

cd /server && npm run docker