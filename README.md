<img src="extension/public/assets/linera/Linera_FullColor_H.svg" width="250" />

# Linera Web client

This repository implements a Web client for the Linera protocol.

# Building

## Setup

This repository contains a Nix flake that precisely specifies its
build environment.  The easiest way to set up the build environment is
to install Nix with flake support (e.g. using the [Determinate Nix
installer](https://github.com/DeterminateSystems/nix-installer)) and
then run `nix develop` to enter the build environment.

Currently we only support building on Linux (`x86_64-unknown-linux-gnu`).

## Building

The project builds with `pnpm`.  First install the JavaScript dependencies:

```shellsession
pnpm install
```

Then build the extension:

```shellsession
cd extension
pnpm build:extension
```

This will result in an unpacked Manifest v3 extension in
`extension/dist/extension`.

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

For development, you can also use `pnpm build --watch` to
automatically rebuild the extension on change.  Changes to the client
worker will not propagate to the extension, but once you run
`wasm-pack build` they will be picked up.
