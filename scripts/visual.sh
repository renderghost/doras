#!/bin/sh
# The visual checks (#18), in the Playwright image CI uses, so screenshots
# match the baselines: fonts and rendering differ between machines. Build
# first (pnpm build), then:
#
#   pnpm visual            compare with the baselines
#   pnpm visual:update     make new baselines, deliberately, to commit
set -eu
IMAGE=mcr.microsoft.com/playwright:v1.65.0-noble
exec docker run --rm --ipc=host -v "$(pwd)":/work -w /work/apps/storybook "$IMAGE" \
  node node_modules/@playwright/test/cli.js test "$@"
