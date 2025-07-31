import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  basename: process.env.PUBLIC_URL ?? '/', // 「ビルド時」にPUBLIC_URLを正しく設定すること
} satisfies Config;
