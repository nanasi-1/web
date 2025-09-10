import { generateRemixSitemap } from "@forge42/seo-tools/remix/sitemap";
import type { RouteConfigEntry } from "@react-router/dev/routes";
import fs from "node:fs/promises";

const { origin } = new URL("https://nanasi-1.github.io/");
globalThis.__reactRouterAppDirectory = "app";

const routes = (await import("~/routes")).default as Promise<RouteConfigEntry[]>

const sitemap = await generateRemixSitemap({
  domain: origin,
  urlTransformer: url => `/web${url}`,
  routes: Object.fromEntries((await routes).map((route) => [route.id, route])),
});

await fs.writeFile("build/client/sitemap.xml", sitemap);