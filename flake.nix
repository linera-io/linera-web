{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs = inputs: inputs.flake-parts.lib.mkFlake { inherit inputs; } {
    systems = import inputs.systems;
    perSystem = { config, self', pkgs, lib, system, rust-overlay, ... }:
      let
        rust = rec {
          toolchain = pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
          nativeBuildInputs = with pkgs; [
            toolchain
            rust-analyzer
          ];
          buildInputs = with pkgs; [
            pkg-config
            openssl
            wasm-pack
          ];
        };

        web = {
          nativeBuildInputs = [ pkgs.nodePackages.pnpm ];
          buildInputs = [];
        };
      in {
        _module.args.pkgs = import inputs.nixpkgs {
          inherit system;
          overlays = [ (import inputs.rust-overlay) ];
        };

        # Rust dev environment
        devShells.default = pkgs.mkShell {
          shellHook = ''
            # For rust-analyzer 'hover' tooltips to work.
            export RUST_SRC_PATH=${rust.toolchain.availableComponents.rust-src}
            export PATH=~/.cargo/bin:$PATH
          '';
          nativeBuildInputs = rust.nativeBuildInputs ++ web.nativeBuildInputs;
          buildInputs = rust.buildInputs ++ web.buildInputs;
        };
      };
  };
}
