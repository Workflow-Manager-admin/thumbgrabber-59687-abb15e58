#!/bin/bash
cd /home/kavia/workspace/code-generation/thumbgrabber-59687-abb15e58/thumbgrabber
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

