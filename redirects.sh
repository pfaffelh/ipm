#!/bin/sh
# The pages of the worlds were called Session-N___-Title/ before (now World-N___-Title/). For each
# world this writes a page at the old address that forwards to the new one (keeping #level-3 etc.),
# so that old links and bookmarks still work. Usage: ./redirects.sh _out/html-multi
set -e
out=${1:-_out/html-multi}
for dir in "$out"/World-*___-*/; do
  new=$(basename "$dir")
  old="Session-${new#World-}"
  mkdir -p "$out/$old"
  cat > "$out/$old/index.html" <<HTML
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>$new</title>
<meta http-equiv="refresh" content="0; url=../$new/">
<script>location.replace('../$new/' + location.hash.replace(/^#task-/, '#level-'))</script>
</head><body><a href="../$new/">$new</a></body></html>
HTML
done
