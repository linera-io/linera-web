{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    linera-protocol.url = "path:linera-protocol";
  };

  outputs = inputs: inputs.flake-parts.lib.mkFlake { inherit inputs; } {
    systems = import inputs.systems;
    perSystem = { config, self', inputs', pkgs, lib, system, ... }:
      {
        devShells.default = pkgs.mkShell {
          inputsFrom = [
            inputs'.linera-protocol.devShells.nightly
          ];
          shellHook = inputs'.linera-protocol.devShells.nightly.shellHook;
          nativeBuildInputs = with pkgs; [ nodePackages.pnpm wasm-bindgen-cli binaryen yq ];
        };
      };
  };
}
