#!/bin/sh
# wait-for-it.sh

set -e

host="$1"
shift
cmd="$@"

until nc -z "$host" 5432; do
  echo "Waiting for postgres at $host:5432..."
  sleep 1
done

echo "Postgres is up - executing command"
exec $cmd 