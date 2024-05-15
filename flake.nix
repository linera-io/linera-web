{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    linera-protocol = {
      type = "git";
      url = "file:linera-protocol?shallow=1&submodules=1";
    };
  };

  outputs = inputs: inputs.flake-parts.lib.mkFlake { inherit inputs; } {
    systems = import inputs.systems;
    perSystem = { config, self', inputs', pkgs, lib, system, ... }:
      {
        devShells.default = pkgs.mkShell {
          inputsFrom = [
            inputs'.linera-protocol.devShells.default
          ];
          shellHook = inputs'.linera-protocol.devShells.default.shellHook;
          nativeBuildInputs = [ pkgs.nodePackages.pnpm ];
        };
      };
  };
}
