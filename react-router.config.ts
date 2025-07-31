import type { Config } from "@react-router/dev/config";
import { copyFile } from 'node:fs/promises';
import path from 'node:path';

const basename = process.env.GITHUB_PAGES ? '/web/' : '/'

export default {
  ssr: false,
  basename,
  // https://zenn.dev/ofk/articles/562098fdab1888
  async buildEnd(args): Promise<void> {
    if (!args.viteConfig.isProduction) return;
    const buildPath = args.viteConfig.build.outDir;
    await copyFile(path.join(buildPath, 'index.html'), path.join(buildPath, '404.html'));
  },
} satisfies Config;
