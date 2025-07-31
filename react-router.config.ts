import type { Config } from "@react-router/dev/config";

const basename = process.env.GITHUB_PAGES ? '/web' : '/'
console.log("env:", process.env.GITHUB_PAGES, basename)

export default {
  ssr: false,
  basename
} satisfies Config;
