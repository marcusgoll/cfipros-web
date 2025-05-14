import type { FeatureFlag } from './index';

declare global {
  interface Window {
    __ENV__?: {
      FEATURE_FLAGS?: {
        [key in FeatureFlag]?: boolean | string;
      };
    };
  }
}

export {};
