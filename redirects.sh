#!/bin/sh
# Old addresses of the worlds forward to the new ones, so that old links and bookmarks still work:
# Session-N___-…/ (the first names), and the worlds that moved when the levels of "From the Lean
# Course" went into the worlds of their rules, and world 8 became "Puzzles". Usage: ./redirects.sh _out/html-multi
set -e
out=${1:-_out/html-multi}
while read old new; do
  rm -rf "$out/$old"
  mkdir -p "$out/$old"
  cat > "$out/$old/index.html" <<HTML
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>$new</title>
<meta http-equiv="refresh" content="0; url=../$new/">
<script>location.replace('../$new/')</script>
</head><body><a href="../$new/">$new</a></body></html>
HTML
done <<'PAGES'
Session-10___-Induction World-9___-Induction
Session-1___-Conjunction World-1___-Conjunction
Session-2___-Implication World-2___-Implication
Session-3___-Disjunction World-3___-Disjunction
Session-4___-Falsity-and-Negation World-4___-Falsity-and-Negation
Session-5___-Classical-Logic World-5___-Classical-Logic
Session-6___-From-the-Lean-Course World-2___-Implication
Session-7___-Equivalence-and-Truth World-6___-Equivalence-and-Truth
Session-8___-Quantifiers World-7___-Quantifiers
Session-9___-Two-Puzzles World-8___-Puzzles
World-10___-Induction World-9___-Induction
World-6___-From-the-Lean-Course World-2___-Implication
World-7___-Equivalence-and-Truth World-6___-Equivalence-and-Truth
World-8___-Quantifiers World-7___-Quantifiers
World-9___-Two-Puzzles World-8___-Puzzles
World-8___-Two-Puzzles World-8___-Puzzles
PAGES
