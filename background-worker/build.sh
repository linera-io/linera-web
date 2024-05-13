#!/bin/sh

rm -rf pkg

# Build for release or debug
wasm-pack build --target=web "$@"

ln js/* manifest.json pkg/
