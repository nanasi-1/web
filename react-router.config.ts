import type { Config } from "@react-router/dev/config";

console.log("env:", import.meta.env.GITHUB_PAGES, process.env.GITHUB_PAGES)

export default {
  ssr: false,
  basename: import.meta.env.GITHUB_PAGES ? '/web' : '/'
} satisfies Config;
