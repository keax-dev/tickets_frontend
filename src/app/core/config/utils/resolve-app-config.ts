import { AppConfig } from '../models/app-config.model';

type GlobalWithAppConfig = typeof globalThis & {
  __APP_CONFIG__?: Partial<AppConfig>;
};

export function resolveAppConfig(defaultConfig: AppConfig): AppConfig {
  const runtimeConfig = (globalThis as GlobalWithAppConfig).__APP_CONFIG__ ?? {};

  return {
    ...defaultConfig,
    ...runtimeConfig,
  };
}
