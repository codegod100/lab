{
  description = "A Nix flake for Rustup with standard toolchain";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        
        # Define the rustup package with standard toolchain
        rustWithToolchain = pkgs.symlinkJoin {
          name = "rust-with-toolchain";
          paths = [ pkgs.rustup ];
          buildInputs = [ pkgs.makeWrapper ];
          postBuild = ''
            wrapProgram $out/bin/rustup --run "rustup default stable"
          '';
        };
      in
      {
        packages = {
          default = rustWithToolchain;
          rustWithToolchain = rustWithToolchain;
        };

        devShells.default = pkgs.mkShell {
          buildInputs = [
            rustWithToolchain
            # Additional dependencies for Rust development
            pkgs.pkg-config
            pkgs.openssl.dev
            pkgs.libiconv
          ] ++ (if pkgs.stdenv.isDarwin then [
            # macOS-specific dependencies
            pkgs.darwin.apple_sdk.frameworks.Security
            pkgs.darwin.apple_sdk.frameworks.SystemConfiguration
          ] else []);

          shellHook = ''
            echo "Rust development environment loaded with rustup and stable toolchain"
            rustup --version
            rustc --version
            cargo --version
          '';
        };
      }
    );
}
