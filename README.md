<img src="extension/public/assets/linera/Linera_FullColor_H.svg" width="250" />

# Linera Web client

This repository implements a Web client for the Linera protocol.

# Building

There are two pieces to be built:

- the client worker (written in Rust, and depending on the core
[`linera-protocol`](https://github.com/linera-io/linera-protocol)
repository).
- and the Web extension (written in TypeScript).

The Web extension depends on the client worker; to build it you must
first build the client worker.

## Client worker

To build the client worker, run `wasm-pack build --target web` from
within the `client-worker` directory.

## Extension

To build the extension to a form that can be loaded into Chrome, run
`pnpm install && pnpm build` from within the `extension` directory.

# Installation

After successfully running `pnpm build`, the extension can be loaded
into Chrome or Chromium:

- Open the settings menu.
- Select ‘Extensions’ → ‘Manage Extensions’.
- Enable ‘Developer mode’.  This will show an option ‘Load unpacked’.
- Navigate to the `extension/dist` directory and select it.
- You've installed the extension!

By default extension icons are hidden behind a top-level ‘Extensions’
menu in the browser toolbar; to make access easier, you can pin this
extension to have it appear at the top level next to the ‘Extensions’
icon.

# Development

## Environment

All prerequisites are encapsulated in the `flake.nix` file: running
`nix develop` will put you into a shell capable of building this
project.  Namely, the requirements are the same as those of
`linera-protocol`, which we depend on, plus a JavaScript package
manager such as [`pnpm`](https://pnpm.io/).

For development, you can also use `pnpm build --watch` to
automatically rebuild the extension on change.  Changes to the client
worker will not propagate to the extension, but once you run
`wasm-pack build` they will be picked up.
