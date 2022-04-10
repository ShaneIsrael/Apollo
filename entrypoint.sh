#!/bin/sh

# setup initial config file
if [ ! -f /server/config.json ]
then
    echo "No config.json file found at /server/config.json. Did you volume mount the config directory?"
    exit
fi

echo "Running dockerized"

cd /server && npm run docker