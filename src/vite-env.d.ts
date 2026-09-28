/// <reference types="vite/client" />

declare const __BUILD_ID__: string;

interface ImportMetaEnv {
  readonly VITE_E2E?: string;
  readonly VITE_BUILD_CHANNEL?: string;
}
