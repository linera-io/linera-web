#!/bin/sh

# Build for release or debug
wasm-pack build --target=web "$@"
