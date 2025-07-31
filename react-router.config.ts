import type { Config } from "@react-router/dev/config";

const basename = process.env.GITHUB_PAGES ? '/web/' : '/'

export default {
  ssr: false,
  basename
} satisfies Config;
