
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const INIT_CWD: string;
	export const ORIGINAL_XDG_CURRENT_DESKTOP: string;
	export const SHELL: string;
	export const XDG_MENU_PREFIX: string;
	export const DEVBOX_INIT_PATH: string;
	export const COLORFGBG: string;
	export const HISTCONTROL: string;
	export const SSH_AUTH_SOCK: string;
	export const GUESTFISH_RESTORE: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const GUESTFISH_PS1: string;
	export const NO_AT_BRIDGE: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const TERM_PROGRAM_VERSION: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const DEVBOX_SYSTEM_SED: string;
	export const GDK_CORE_DEVICE_EVENTS: string;
	export const DEVBOX_WD: string;
	export const LOGNAME: string;
	export const DEBUGINFOD_IMA_CERT_PATH: string;
	export const PATH: string;
	export const DEVBOX_CONFIG_DIR: string;
	export const TERM: string;
	export const WAYLAND_DISPLAY: string;
	export const XDG_DATA_DIRS: string;
	export const XDG_SEAT: string;
	export const XDG_SESSION_DESKTOP: string;
	export const GPG_TTY: string;
	export const XDG_SESSION_ID: string;
	export const LESSOPEN: string;
	export const PAM_KWALLET5_LOGIN: string;
	export const LANG: string;
	export const SESSION_MANAGER: string;
	export const GTK_RC_FILES: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const KDE_FULL_SESSION: string;
	export const XDG_SESSION_PATH: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const GIT_ASKPASS: string;
	export const XDG_SESSION_TYPE: string;
	export const XDG_VTNR: string;
	export const XKB_DEFAULT_MODEL: string;
	export const _: string;
	export const DISPLAY: string;
	export const QT_WAYLAND_RECONNECT: string;
	export const XAUTHORITY: string;
	export const GDK_BACKEND: string;
	export const DEBUGINFOD_URLS: string;
	export const npm_config_user_agent: string;
	export const DEVBOX_SYSTEM_BASH: string;
	export const NODE_ENV: string;
	export const HISTSIZE: string;
	export const ICEAUTHORITY: string;
	export const OLDPWD: string;
	export const HOME: string;
	export const BUN_INSTALL: string;
	export const SSH_ASKPASS: string;
	export const INFOPATH: string;
	export const COLORTERM: string;
	export const KONSOLE_DBUS_SERVICE: string;
	export const KDE_SESSION_UID: string;
	export const CHROME_DESKTOP: string;
	export const DESKTOP_SESSION: string;
	export const XDG_CONFIG_DIRS: string;
	export const XDG_SEAT_PATH: string;
	export const SHELL_SESSION_ID: string;
	export const DEVBOX_PROJECT_ROOT: string;
	export const GTK2_RC_FILES: string;
	export const KONSOLE_VERSION: string;
	export const HOMEBREW_CELLAR: string;
	export const KDEDIRS: string;
	export const KDE_SESSION_VERSION: string;
	export const LS_COLORS: string;
	export const NIX_PROFILES: string;
	export const SYSTEMD_SLEEP_FREEZE_USER_SESSIONS: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const DEVBOX_PATH_STACK: string;
	export const DEVBOX_REFRESH_ALIAS_2089e2dd9c5bd8e61a565bd8799062e96c409307340885c414d388908ffdf4cd: string;
	export const SHLVL: string;
	export const WINDOWID: string;
	export const BREW_BASH_COMPLETION: string;
	export const INVOCATION_ID: string;
	export const HOSTNAME: string;
	export const QT_AUTO_SCREEN_SCALE_FACTOR: string;
	export const SUDO_ASKPASS: string;
	export const TERM_PROGRAM: string;
	export const GUESTFISH_INIT: string;
	export const HOMEBREW_PREFIX: string;
	export const JOURNAL_STREAM: string;
	export const KONSOLE_DBUS_WINDOW: string;
	export const XKB_DEFAULT_LAYOUT: string;
	export const NIX_SSL_CERT_FILE: string;
	export const MAIL: string;
	export const PWD: string;
	export const XDG_SESSION_CLASS: string;
	export const __DEVBOX_SHELLENV_HASH_2089e2dd9c5bd8e61a565bd8799062e96c409307340885c414d388908ffdf4cd: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const XDG_RUNTIME_DIR: string;
	export const DEVBOX_NIX_ENV_PATH_2089e2dd9c5bd8e61a565bd8799062e96c409307340885c414d388908ffdf4cd: string;
	export const DEVBOX_PACKAGES_DIR: string;
	export const KDE_APPLICATIONS_AS_SCOPE: string;
	export const GUESTFISH_OUTPUT: string;
	export const HOMEBREW_REPOSITORY: string;
	export const KONSOLE_DBUS_SESSION: string;
	export const USER: string;
	export const EDITOR: string;
	export const SYSTEMD_EXEC_PID: string;
	export const MANAGERPID: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		INIT_CWD: string;
		ORIGINAL_XDG_CURRENT_DESKTOP: string;
		SHELL: string;
		XDG_MENU_PREFIX: string;
		DEVBOX_INIT_PATH: string;
		COLORFGBG: string;
		HISTCONTROL: string;
		SSH_AUTH_SOCK: string;
		GUESTFISH_RESTORE: string;
		MEMORY_PRESSURE_WATCH: string;
		GUESTFISH_PS1: string;
		NO_AT_BRIDGE: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		TERM_PROGRAM_VERSION: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		DEVBOX_SYSTEM_SED: string;
		GDK_CORE_DEVICE_EVENTS: string;
		DEVBOX_WD: string;
		LOGNAME: string;
		DEBUGINFOD_IMA_CERT_PATH: string;
		PATH: string;
		DEVBOX_CONFIG_DIR: string;
		TERM: string;
		WAYLAND_DISPLAY: string;
		XDG_DATA_DIRS: string;
		XDG_SEAT: string;
		XDG_SESSION_DESKTOP: string;
		GPG_TTY: string;
		XDG_SESSION_ID: string;
		LESSOPEN: string;
		PAM_KWALLET5_LOGIN: string;
		LANG: string;
		SESSION_MANAGER: string;
		GTK_RC_FILES: string;
		XDG_CURRENT_DESKTOP: string;
		KDE_FULL_SESSION: string;
		XDG_SESSION_PATH: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		GIT_ASKPASS: string;
		XDG_SESSION_TYPE: string;
		XDG_VTNR: string;
		XKB_DEFAULT_MODEL: string;
		_: string;
		DISPLAY: string;
		QT_WAYLAND_RECONNECT: string;
		XAUTHORITY: string;
		GDK_BACKEND: string;
		DEBUGINFOD_URLS: string;
		npm_config_user_agent: string;
		DEVBOX_SYSTEM_BASH: string;
		NODE_ENV: string;
		HISTSIZE: string;
		ICEAUTHORITY: string;
		OLDPWD: string;
		HOME: string;
		BUN_INSTALL: string;
		SSH_ASKPASS: string;
		INFOPATH: string;
		COLORTERM: string;
		KONSOLE_DBUS_SERVICE: string;
		KDE_SESSION_UID: string;
		CHROME_DESKTOP: string;
		DESKTOP_SESSION: string;
		XDG_CONFIG_DIRS: string;
		XDG_SEAT_PATH: string;
		SHELL_SESSION_ID: string;
		DEVBOX_PROJECT_ROOT: string;
		GTK2_RC_FILES: string;
		KONSOLE_VERSION: string;
		HOMEBREW_CELLAR: string;
		KDEDIRS: string;
		KDE_SESSION_VERSION: string;
		LS_COLORS: string;
		NIX_PROFILES: string;
		SYSTEMD_SLEEP_FREEZE_USER_SESSIONS: string;
		VSCODE_GIT_IPC_HANDLE: string;
		DEVBOX_PATH_STACK: string;
		DEVBOX_REFRESH_ALIAS_2089e2dd9c5bd8e61a565bd8799062e96c409307340885c414d388908ffdf4cd: string;
		SHLVL: string;
		WINDOWID: string;
		BREW_BASH_COMPLETION: string;
		INVOCATION_ID: string;
		HOSTNAME: string;
		QT_AUTO_SCREEN_SCALE_FACTOR: string;
		SUDO_ASKPASS: string;
		TERM_PROGRAM: string;
		GUESTFISH_INIT: string;
		HOMEBREW_PREFIX: string;
		JOURNAL_STREAM: string;
		KONSOLE_DBUS_WINDOW: string;
		XKB_DEFAULT_LAYOUT: string;
		NIX_SSL_CERT_FILE: string;
		MAIL: string;
		PWD: string;
		XDG_SESSION_CLASS: string;
		__DEVBOX_SHELLENV_HASH_2089e2dd9c5bd8e61a565bd8799062e96c409307340885c414d388908ffdf4cd: string;
		MEMORY_PRESSURE_WRITE: string;
		XDG_RUNTIME_DIR: string;
		DEVBOX_NIX_ENV_PATH_2089e2dd9c5bd8e61a565bd8799062e96c409307340885c414d388908ffdf4cd: string;
		DEVBOX_PACKAGES_DIR: string;
		KDE_APPLICATIONS_AS_SCOPE: string;
		GUESTFISH_OUTPUT: string;
		HOMEBREW_REPOSITORY: string;
		KONSOLE_DBUS_SESSION: string;
		USER: string;
		EDITOR: string;
		SYSTEMD_EXEC_PID: string;
		MANAGERPID: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
