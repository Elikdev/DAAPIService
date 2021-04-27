#!/bin/bash
set -euxo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

if [ $# -eq 1 ] && [ "$1" == "wait" ]; then
  $DIR/wait-for-it.sh -t 30 postgres:5432
fi

npm run dev