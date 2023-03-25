#!/bin/sh
set -eu
cd "$(dirname "$0")"

op run --env-file=.env -- deno repl --allow-read=./lib.ts --allow-env=OPENAI_API_KEY --allow-net=api.openai.com --eval-file=./init.ts
