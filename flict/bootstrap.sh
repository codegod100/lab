#!/usr/bin/env bash
set -eu

__mise_bootstrap() {
    local script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
    local project_dir=$( cd -- "$( dirname -- "$script_dir" )" &> /dev/null && pwd )
    export MISE_BOOTSTRAP_PROJECT_DIR="$project_dir"
    local cache_home="${XDG_CACHE_HOME:-$HOME/.cache}/mise"
    export MISE_INSTALL_PATH="$cache_home/mise-2025.6.0"
    install() {
        #!/bin/sh
        set -eu

        #region logging setup
        if [ "${MISE_DEBUG-}" = "true" ] || [ "${MISE_DEBUG-}" = "1" ]; then
          debug() {
            echo "$@" >&2
          }
        else
          debug() {
            :
          }
        fi

        if [ "${MISE_QUIET-}" = "1" ] || [ "${MISE_QUIET-}" = "true" ]; then
          info() {
            :
          }
        else
          info() {
            echo "$@" >&2
          }
        fi

        error() {
          echo "$@" >&2
          exit 1
        }
        #endregion

        #region environment setup
        get_os() {
          os="$(uname -s)"
          if [ "$os" = Darwin ]; then
            echo "macos"
          elif [ "$os" = Linux ]; then
            echo "linux"
          else
            error "unsupported OS: $os"
          fi
        }

        get_arch() {
          musl=""
          if type ldd >/dev/null 2>/dev/null; then
            libc=$(ldd /bin/ls | grep 'musl' | head -1 | cut -d ' ' -f1)
            if [ -n "$libc" ]; then
              musl="-musl"
            fi
          fi
          arch="$(uname -m)"
          if [ "$arch" = x86_64 ]; then
            echo "x64$musl"
          elif [ "$arch" = aarch64 ] || [ "$arch" = arm64 ]; then
            echo "arm64$musl"
          elif [ "$arch" = armv7l ]; then
            echo "armv7$musl"
          else
            error "unsupported architecture: $arch"
          fi
        }

        get_ext() {
          if [ -n "${MISE_INSTALL_EXT:-}" ]; then
            echo "$MISE_INSTALL_EXT"
          elif [ -n "${MISE_VERSION:-}" ] && echo "$MISE_VERSION" | grep -q '^v2024'; then
            # 2024 versions don't have zstd tarballs
            echo "tar.gz"
          elif tar_supports_zstd; then
            echo "tar.zst"
          elif command -v zstd >/dev/null 2>&1; then
            echo "tar.zst"
          else
            echo "tar.gz"
          fi
        }

        tar_supports_zstd() {
          # tar is bsdtar or version is >= 1.31
          if tar --version | grep -q 'bsdtar' && command -v zstd >/dev/null 2>&1; then
            true
          elif tar --version | grep -q '1\.(3[1-9]|[4-9][0-9]'; then
            true
          else
            false
          fi
        }

        shasum_bin() {
          if command -v shasum >/dev/null 2>&1; then
            echo "shasum"
          elif command -v sha256sum >/dev/null 2>&1; then
            echo "sha256sum"
          else
            error "mise install requires shasum or sha256sum but neither is installed. Aborting."
          fi
        }

        get_checksum() {
          version=$1
          os="$(get_os)"
          arch="$(get_arch)"
          ext="$(get_ext)"
          url="https://github.com/jdx/mise/releases/download/v${version}/SHASUMS256.txt"

          # For current version use static checksum otherwise
          # use checksum from releases
          if [ "$version" = "v2025.6.0" ]; then
            checksum_linux_x86_64="a9359b3e4079a6f1c1057a245d2f3cbd07e9ceefd66eb6460b1e668cfd78ebac  ./mise-v2025.6.0-linux-x64.tar.gz"
            checksum_linux_x86_64_musl="1637d56a2780b34c3c9bfe890d9a2e1b0d7ff1dfd008285b26f7357096b88e31  ./mise-v2025.6.0-linux-x64-musl.tar.gz"
            checksum_linux_arm64="2c81958c721046c9b7fcb138403b2c97df7185cc8158461d55fef2f21cc7e1d5  ./mise-v2025.6.0-linux-arm64.tar.gz"
            checksum_linux_arm64_musl="d76a24ca3b22fba4855657a8322df33f16506b61b0928bed8b542a1d114a4d5a  ./mise-v2025.6.0-linux-arm64-musl.tar.gz"
            checksum_linux_armv7="e0e6cb9e6e2da9e270adf41bfd058cf7c25001fff9b8026f29246bb7d787ea1b  ./mise-v2025.6.0-linux-armv7.tar.gz"
            checksum_linux_armv7_musl="f06373870c9191b379b02939612f5d3ff2978efc9ce2c4e4475901b350b7724d  ./mise-v2025.6.0-linux-armv7-musl.tar.gz"
            checksum_macos_x86_64="82a4898742620e7430e97e4d4ebc20b2658956d860e2765bfb7201277aaac827  ./mise-v2025.6.0-macos-x64.tar.gz"
            checksum_macos_arm64="de15416a40b11518c3fbd3fd5e4bb56b3d3664af2a3c2a0ff1985139c718b245  ./mise-v2025.6.0-macos-arm64.tar.gz"
            checksum_linux_x86_64_zstd="4ed33cb3c38d541b77f555c229df608cc3b2cd8a7f819826ef71fabbea2d72e8  ./mise-v2025.6.0-linux-x64.tar.zst"
            checksum_linux_x86_64_musl_zstd="49d1eb007dab8e756c2baf54a22f567a257f1af80a9627434d1a90059aa9e5c2  ./mise-v2025.6.0-linux-x64-musl.tar.zst"
            checksum_linux_arm64_zstd="172f59c38a9ab9c9b3c03d71db29f709187caf7dea0a04df456248136504b85c  ./mise-v2025.6.0-linux-arm64.tar.zst"
            checksum_linux_arm64_musl_zstd="1ffecadf061efcbf94c7f1b28ed6fd5f5a55c4e6e396aa2f34e33b321feeffc8  ./mise-v2025.6.0-linux-arm64-musl.tar.zst"
            checksum_linux_armv7_zstd="fa06aee384566744dab3aabf779280610d6d984e08850654cc3f648514c7906a  ./mise-v2025.6.0-linux-armv7.tar.zst"
            checksum_linux_armv7_musl_zstd="c958c78db8effa669a470305bcac65bc02787b2459a856607c12e0bc278fb510  ./mise-v2025.6.0-linux-armv7-musl.tar.zst"
            checksum_macos_x86_64_zstd="a07cba91599ded15a89ac9a8862fbff722d41c2fc4d6f35a2f8a29c3ea6d00b4  ./mise-v2025.6.0-macos-x64.tar.zst"
            checksum_macos_arm64_zstd="cf73b553b21da8d6f173e6e1cc12e4e0f9e5d834babe1170b4b7dcd5548b63d7  ./mise-v2025.6.0-macos-arm64.tar.zst"

            # TODO: refactor this, it's a bit messy
            if [ "$(get_ext)" = "tar.zst" ]; then
              if [ "$os" = "linux" ]; then
                if [ "$arch" = "x64" ]; then
                  echo "$checksum_linux_x86_64_zstd"
                elif [ "$arch" = "x64-musl" ]; then
                  echo "$checksum_linux_x86_64_musl_zstd"
                elif [ "$arch" = "arm64" ]; then
                  echo "$checksum_linux_arm64_zstd"
                elif [ "$arch" = "arm64-musl" ]; then
                  echo "$checksum_linux_arm64_musl_zstd"
                elif [ "$arch" = "armv7" ]; then
                  echo "$checksum_linux_armv7_zstd"
                elif [ "$arch" = "armv7-musl" ]; then
                  echo "$checksum_linux_armv7_musl_zstd"
                else
                  warn "no checksum for $os-$arch"
                fi
              elif [ "$os" = "macos" ]; then
                if [ "$arch" = "x64" ]; then
                  echo "$checksum_macos_x86_64_zstd"
                elif [ "$arch" = "arm64" ]; then
                  echo "$checksum_macos_arm64_zstd"
                else
                  warn "no checksum for $os-$arch"
                fi
              else
                warn "no checksum for $os-$arch"
              fi
            else
              if [ "$os" = "linux" ]; then
                if [ "$arch" = "x64" ]; then
                  echo "$checksum_linux_x86_64"
                elif [ "$arch" = "x64-musl" ]; then
                  echo "$checksum_linux_x86_64_musl"
                elif [ "$arch" = "arm64" ]; then
                  echo "$checksum_linux_arm64"
                elif [ "$arch" = "arm64-musl" ]; then
                  echo "$checksum_linux_arm64_musl"
                elif [ "$arch" = "armv7" ]; then
                  echo "$checksum_linux_armv7"
                elif [ "$arch" = "armv7-musl" ]; then
                  echo "$checksum_linux_armv7_musl"
                else
                  warn "no checksum for $os-$arch"
                fi
              elif [ "$os" = "macos" ]; then
                if [ "$arch" = "x64" ]; then
                  echo "$checksum_macos_x86_64"
                elif [ "$arch" = "arm64" ]; then
                  echo "$checksum_macos_arm64"
                else
                  warn "no checksum for $os-$arch"
                fi
              else
                warn "no checksum for $os-$arch"
              fi
            fi
          else
            if command -v curl >/dev/null 2>&1; then
              debug ">" curl -fsSL "$url"
              checksums="$(curl --compressed -fsSL "$url")"
            else
              if command -v wget >/dev/null 2>&1; then
                debug ">" wget -qO - "$url"
                stderr=$(mktemp)
                checksums="$(wget -qO - "$url")"
              else
                error "mise standalone install specific version requires curl or wget but neither is installed. Aborting."
              fi
            fi
            # TODO: verify with minisign or gpg if available

            checksum="$(echo "$checksums" | grep "$os-$arch.$ext")"
            if ! echo "$checksum" | grep -Eq "^([0-9a-f]{32}|[0-9a-f]{64})"; then
              warn "no checksum for mise $version and $os-$arch"
            else
              echo "$checksum"
            fi
          fi
        }

        #endregion

        download_file() {
          url="$1"
          filename="$(basename "$url")"
          cache_dir="$(mktemp -d)"
          file="$cache_dir/$filename"

          info "mise: installing mise..."

          if command -v curl >/dev/null 2>&1; then
            debug ">" curl -#fLo "$file" "$url"
            curl -#fLo "$file" "$url"
          else
            if command -v wget >/dev/null 2>&1; then
              debug ">" wget -qO "$file" "$url"
              stderr=$(mktemp)
              wget -O "$file" "$url" >"$stderr" 2>&1 || error "wget failed: $(cat "$stderr")"
            else
              error "mise standalone install requires curl or wget but neither is installed. Aborting."
            fi
          fi

          echo "$file"
        }

        install_mise() {
          version="${MISE_VERSION:-v2025.6.0}"
          version="${version#v}"
          os="$(get_os)"
          arch="$(get_arch)"
          ext="$(get_ext)"
          install_path="${MISE_INSTALL_PATH:-$HOME/.local/bin/mise}"
          install_dir="$(dirname "$install_path")"
          tarball_url="https://github.com/jdx/mise/releases/download/v${version}/mise-v${version}-${os}-${arch}.${ext}"

          cache_file=$(download_file "$tarball_url")
          debug "mise-setup: tarball=$cache_file"

          debug "validating checksum"
          cd "$(dirname "$cache_file")" && get_checksum "$version" | "$(shasum_bin)" -c >/dev/null

          # extract tarball
          mkdir -p "$install_dir"
          rm -rf "$install_path"
          cd "$(mktemp -d)"
          if [ "$(get_ext)" = "tar.zst" ] && ! tar_supports_zstd; then
            zstd -d -c "$cache_file" | tar -xf -
          else
            tar -xf "$cache_file"
          fi
          mv mise/bin/mise "$install_path"
          info "mise: installed successfully to $install_path"
        }

        after_finish_help() {
          case "${SHELL:-}" in
          */zsh)
            info "mise: run the following to activate mise in your shell:"
            info "echo \"eval \\\"\\\$($install_path activate zsh)\\\"\" >> \"${ZDOTDIR-$HOME}/.zshrc\""
            info ""
            info "mise: run \`mise doctor\` to verify this is setup correctly"
            ;;
          */bash)
            info "mise: run the following to activate mise in your shell:"
            info "echo \"eval \\\"\\\$($install_path activate bash)\\\"\" >> ~/.bashrc"
            info ""
            info "mise: run \`mise doctor\` to verify this is setup correctly"
            ;;
          */fish)
            info "mise: run the following to activate mise in your shell:"
            info "echo \"$install_path activate fish | source\" >> ~/.config/fish/config.fish"
            info ""
            info "mise: run \`mise doctor\` to verify this is setup correctly"
            ;;
          *)
            info "mise: run \`$install_path --help\` to get started"
            ;;
          esac
        }

        install_mise
        if [ "${MISE_INSTALL_HELP-}" != 0 ]; then
          after_finish_help
        fi

        cd "$MISE_BOOTSTRAP_PROJECT_DIR"
    }
    local MISE_INSTALL_HELP=0
    test -f "$MISE_INSTALL_PATH" || install
}
__mise_bootstrap
exec "$MISE_INSTALL_PATH" "$@"
